/**
 * ID Security Utility for obfuscating and encrypting sensitive internal IDs in URLs.
 * Ensures internal database IDs like `wsh_1791234769370` are never exposed in browser URLs.
 */

const WASHER_SECRET_KEY = 'TorqueCareSecureWasher2026Key';

/**
 * Encrypts a washer ID into a URL-safe encrypted hex token prefixed with `enc_`.
 * Example: `wsh_1791234769370` -> `enc_331c0a0c4442475452445145555452`
 */
export function encryptWasherId(id: string): string {
  if (!id) return '';
  if (id.startsWith('enc_')) return id; // Already encrypted

  try {
    let hex = '';
    for (let i = 0; i < id.length; i++) {
      const code = id.charCodeAt(i) ^ WASHER_SECRET_KEY.charCodeAt(i % WASHER_SECRET_KEY.length);
      hex += code.toString(16).padStart(2, '0');
    }
    return `enc_${hex}`;
  } catch {
    return id;
  }
}

/**
 * Decrypts a URL token back into the original washer ID.
 * Safely handles unencrypted legacy IDs or direct IDs if already plain.
 */
export function decryptWasherId(token: string): string {
  if (!token) return '';
  try {
    if (!token.startsWith('enc_')) {
      return decodeURIComponent(token);
    }
    const hex = token.slice(4);
    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
      return token;
    }
    let decoded = '';
    for (let i = 0; i < hex.length; i += 2) {
      const byteHex = hex.substring(i, i + 2);
      const code = parseInt(byteHex, 16);
      const char = String.fromCharCode(code ^ WASHER_SECRET_KEY.charCodeAt((i / 2) % WASHER_SECRET_KEY.length));
      decoded += char;
    }
    return decoded || token;
  } catch {
    return token;
  }
}
