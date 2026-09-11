// Lightweight API client for Monor Xur. Base URL comes from EXPO_PUBLIC_BACKEND_URL.
// Backend routes are all under /api.

const BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

export type Role = "caregiver" | "health_worker";

export type User = {
  id: string;
  email: string;
  role: Role;
  name: string;
};

export type AuthResult = {
  access_token: string;
  token_type: string;
  user: User;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const { method = "GET", body, token } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const detail =
      (data && typeof data === "object" && (data.detail || data.message)) ||
      (typeof data === "string" && data) ||
      "Something went wrong. Please try again.";
    throw new ApiError(res.status, String(detail));
  }
  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResult>("/auth/login", { method: "POST", body: { email, password } }),

  register: (email: string, password: string, role: Role, name: string) =>
    request<AuthResult>("/auth/register", {
      method: "POST",
      body: { email, password, role, name },
    }),

  me: (token: string) => request<User>("/auth/me", { token }),
};
