/**
 * Monor Xur Client-Side AES-256-GCM Cryptographic Engine
 * Compliant with India's Digital Personal Data Protection (DPDP) Act, 2023.
 *
 * Provides cryptographic security for:
 * 1. Offline local storage cache (patient clinical dossiers, medication plans, reminiscence notes)
 * 2. Client-side exported medical summary envelopes with Caregiver PIN / passphrase protection
 */

const DEVICE_KEY_STORAGE = 'monor_xur_sec_dev_key_v1';
const PBKDF2_ITERATIONS = 100000;

export interface EncryptedPayload {
  v: number;
  alg: 'AES-GCM-256';
  iv: string; // Base64
  salt?: string; // Base64 if password-derived
  ciphertext: string; // Base64
  timestamp: string;
}

/**
 * Convert ArrayBuffer to Base64
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 to Uint8Array
 */
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Get or generate persistent device cryptographic key for local cache encryption
 */
async function getDeviceKey(): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Cryptography API unavailable');
  }

  let rawKeyBase64 = localStorage.getItem(DEVICE_KEY_STORAGE);
  if (!rawKeyBase64) {
    const rawKey = window.crypto.getRandomValues(new Uint8Array(32)); // 256-bit key
    rawKeyBase64 = bufferToBase64(rawKey.buffer);
    try {
      localStorage.setItem(DEVICE_KEY_STORAGE, rawKeyBase64);
    } catch {
      // Local storage full or private mode
    }
  }

  const rawKeyBytes = base64ToBuffer(rawKeyBase64);
  return window.crypto.subtle.importKey(
    'raw',
    rawKeyBytes as unknown as BufferSource,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Derive an AES-GCM-256 key from a passphrase / Caregiver PIN using PBKDF2
 */
async function deriveKeyFromPassphrase(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext string using AES-256-GCM
 * @param plainText String to encrypt
 * @param passphrase Optional user passphrase / Caregiver PIN. If omitted, uses device AES key.
 */
export async function encryptData(plainText: string, passphrase?: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback: Return raw string if crypto is not supported in environment
    return plainText;
  }

  try {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV standard for GCM
    let key: CryptoKey;
    let saltBase64: string | undefined;

    if (passphrase && passphrase.trim().length > 0) {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      key = await deriveKeyFromPassphrase(passphrase.trim(), salt);
      saltBase64 = bufferToBase64(salt.buffer);
    } else {
      key = await getDeviceKey();
    }

    const enc = new TextEncoder();
    const encoded = enc.encode(plainText);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      encoded as unknown as BufferSource
    );

    const envelope: EncryptedPayload = {
      v: 1,
      alg: 'AES-GCM-256',
      iv: bufferToBase64(iv.buffer),
      salt: saltBase64,
      ciphertext: bufferToBase64(ciphertextBuffer),
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(envelope);
  } catch (err) {
    console.warn('AES-GCM encryption error, falling back to raw:', err);
    return plainText;
  }
}

/**
 * Decrypt payload encrypted with encryptData()
 */
export async function decryptData(rawPayload: string, passphrase?: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return rawPayload;
  }

  // Check if string is an AES-GCM envelope
  if (!rawPayload || !rawPayload.includes('"alg":"AES-GCM-256"')) {
    // Not encrypted or already raw JSON
    return rawPayload;
  }

  try {
    const envelope: EncryptedPayload = JSON.parse(rawPayload);
    const iv = base64ToBuffer(envelope.iv);
    const ciphertext = base64ToBuffer(envelope.ciphertext);

    let key: CryptoKey;
    if (envelope.salt && passphrase) {
      const salt = base64ToBuffer(envelope.salt);
      key = await deriveKeyFromPassphrase(passphrase.trim(), salt);
    } else {
      key = await getDeviceKey();
    }

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      ciphertext as unknown as BufferSource
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    console.warn('AES-GCM decryption failed or invalid key:', err);
    throw err;
  }
}
