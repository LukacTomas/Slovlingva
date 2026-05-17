/**
 * PIN hashing utilities.
 *
 * Uses a simple sync hash (djb2 + salt) rather than Web Crypto SHA-256,
 * because this is a local-only device lock for kids — not a security-critical
 * password store. The hash prevents casual plaintext reading from DevTools.
 *
 * When server auth is added later, server-side passwords will use proper
 * bcrypt/argon2. This PIN layer stays local and orthogonal.
 */

const SALT = 'slovlingva-pin-v1:'

/** Validate that a raw PIN is exactly 4 digits. */
export function isValidPin(raw: string): boolean {
  return /^\d{4}$/.test(raw)
}

/**
 * Hash a 4-digit PIN string into a non-reversible hex digest.
 * Throws if the PIN is not exactly 4 digits.
 */
export function hashPin(raw: string): string {
  if (!isValidPin(raw)) throw new Error('PIN must be exactly 4 digits')
  return djb2Hash(SALT + raw)
}

/**
 * Verify a raw PIN against a stored hash.
 * Returns true if they match.
 */
export function verifyPin(raw: string, storedHash: string): boolean {
  if (!isValidPin(raw)) return false
  return djb2Hash(SALT + raw) === storedHash
}

/**
 * DJB2 hash → 16-char hex string.
 * Deterministic, fast, good distribution for short inputs.
 */
function djb2Hash(input: string): string {
  let h1 = 5381
  let h2 = 52711
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i)
    h1 = ((h1 << 5) + h1 + ch) >>> 0
    h2 = ((h2 << 5) + h2 + ch) >>> 0
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')
}
