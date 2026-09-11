from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import jwt
import bcrypt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from bson import ObjectId


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Auth config
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.environ.get('JWT_EXPIRE_MINUTES', '43200'))  # 30 days

# Create the main app without a prefix
app = FastAPI(title="Monor Xur API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)

ALLOWED_ROLES = {"caregiver", "health_worker"}

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------
# Password + token helpers
# --------------------------------------------------------------------------
def hash_password(password: str) -> str:
    pw = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8")[:72], hashed.encode("utf-8"))
    except Exception:
        return False


# Always-run dummy hash to reduce timing-based user enumeration
DUMMY_HASH = hash_password("dummy-password-never-used")


def create_access_token(user_id: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    claims = {
        "sub": user_id,
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(claims, JWT_SECRET, algorithm=JWT_ALGORITHM)


def public_user(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "email": doc["email"],
        "role": doc["role"],
        "name": doc.get("name", ""),
    }


# --------------------------------------------------------------------------
# Models
# --------------------------------------------------------------------------
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    role: str
    name: Optional[str] = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    email: str
    role: str
    name: str = ""


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


# --------------------------------------------------------------------------
# Auth dependency
# --------------------------------------------------------------------------
async def current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
) -> dict:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise unauthorized
    try:
        claims = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "exp", "role"]},
        )
        doc = await db.users.find_one({"_id": ObjectId(claims["sub"])})
    except (jwt.InvalidTokenError, ValueError, TypeError, Exception):
        raise unauthorized
    if not doc or doc.get("role") != claims["role"]:
        raise unauthorized
    return doc


# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "Monor Xur API is running"}


@api_router.get("/health")
async def health():
    return {"ok": True}


@api_router.post("/auth/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest):
    role = body.role.strip().lower()
    if role not in ALLOWED_ROLES:
        raise HTTPException(400, "Role must be caregiver or health_worker")
    email = str(body.email).strip().lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(409, "An account with this email already exists")
    doc = {
        "email": email,
        "password_hash": hash_password(body.password),
        "role": role,
        "name": (body.name or "").strip(),
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {
        "access_token": create_access_token(str(doc["_id"]), role),
        "user": public_user(doc),
    }


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    email = str(body.email).strip().lower()
    doc = await db.users.find_one({"email": email})
    valid = (
        verify_password(body.password, doc["password_hash"])
        if doc
        else verify_password(body.password, DUMMY_HASH)
    )
    if not doc or not valid:
        raise HTTPException(401, "Invalid email or password")
    return {
        "access_token": create_access_token(str(doc["_id"]), doc["role"]),
        "user": public_user(doc),
    }


@api_router.get("/auth/me", response_model=UserPublic)
async def me(user=Depends(current_user)):
    return public_user(user)


@api_router.get("/patient/public-content")
async def patient_public_content():
    return {"mode": "patient", "requires_login": False}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    # Seed demo accounts (idempotent) so caregiver/ASHA modes can be tested.
    demo = [
        {"email": "caregiver@monorxur.com", "password": "Care12345", "role": "caregiver", "name": "Priya (Family)"},
        {"email": "asha@monorxur.com", "password": "Asha12345", "role": "health_worker", "name": "Sunita (ASHA)"},
    ]
    for d in demo:
        exists = await db.users.find_one({"email": d["email"]})
        if not exists:
            await db.users.insert_one({
                "email": d["email"],
                "password_hash": hash_password(d["password"]),
                "role": d["role"],
                "name": d["name"],
                "created_at": datetime.now(timezone.utc),
            })
            logger.info("Seeded demo account %s", d["email"])


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
