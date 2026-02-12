/**
 * Encode a string as base64 (UTF-8 safe, handles large strings).
 * Used for embedding CSV content into Python code strings.
 */
export function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const chunks: string[] = [];
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    chunks.push(String.fromCharCode(...chunk));
  }
  return btoa(chunks.join(''));
}
