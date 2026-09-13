/**
 * Client-Side End-to-End Encryption (E2EE) and Cryptographic Checksum Engine
 * Uses Web Crypto API for zero-trust client-side encryption.
 */

export async function computeSHA256(data: string | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof data === 'string') {
    const encoder = new TextEncoder();
    buffer = encoder.encode(data).buffer;
  } else {
    buffer = data;
  }
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate an ephemeral cryptographic AES-256-GCM key for client-side session encryption
export async function generateSessionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt plaintext or file base64 data client-side before cloud bucket upload
export async function encryptData(
  plainText: string,
  key: CryptoKey
): Promise<{ cipherTextBase64: string; ivHex: string }> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(plainText);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded
  );

  const cipherArray = Array.from(new Uint8Array(cipherBuffer));
  const cipherTextBase64 = btoa(String.fromCharCode(...cipherArray));
  const ivHex = Array.from(iv)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return { cipherTextBase64, ivHex };
}
