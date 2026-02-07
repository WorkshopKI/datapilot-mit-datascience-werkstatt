// SHA-256 hash utility for data integrity checks
// Uses Web Crypto API (available in all modern browsers and Node 15+)

/**
 * Convert an ArrayBuffer to a hex string.
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple 32-bit fallback hash for environments without Web Crypto API.
 */
function simpleFallbackHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Generate a SHA-256 hex hash from a string.
 * Falls back to a simple 32-bit hash when Web Crypto is unavailable.
 */
export async function generateHash(data: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return bufferToHex(hashBuffer);
  }

  return simpleFallbackHash(data);
}

/**
 * Verify a string against an expected hash.
 */
export async function verifyHash(data: string, expectedHash: string): Promise<boolean> {
  const actualHash = await generateHash(data);
  return actualHash === expectedHash;
}

/**
 * Compute a SHA-256 hex hash for a File object.
 * Reads the file as an ArrayBuffer and hashes it via Web Crypto API.
 */
export async function computeFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return bufferToHex(hashBuffer);
  }

  // Fallback: hash the text content
  const text = new TextDecoder().decode(arrayBuffer);
  return simpleFallbackHash(text);
}
