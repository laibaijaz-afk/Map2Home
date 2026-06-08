// Set env vars BEFORE requiring the module so dotenv.config() sees them as already-set
// and does not overwrite them (dotenv never overrides existing process.env keys).
process.env.JWT_SECRET = 'unit-test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRY = '1h';

const { generateToken, verifyToken, generateRandomToken, hashToken } = require('../../../utils/tokenUtils');

// ─────────────────────────────────────────────────────────────
// generateToken
// ─────────────────────────────────────────────────────────────
describe('generateToken', () => {
  test('happy path: returns a non-empty string', () => {
    const token = generateToken(1);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('returned value has the three-segment JWT format (header.payload.signature)', () => {
    const token = generateToken(1);
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
  });

  test('token payload encodes the correct userId', () => {
    const token = generateToken(42);
    const decoded = verifyToken(token);
    expect(decoded.id).toBe(42);
  });

  test('different user IDs produce different tokens', () => {
    const token1 = generateToken(1);
    const token2 = generateToken(2);
    expect(token1).not.toBe(token2);
  });

  test('custom expiresIn is accepted and token remains valid', () => {
    const token = generateToken(99, '10m');
    const decoded = verifyToken(token);
    expect(decoded.id).toBe(99);
  });

  test('expired token (expiresIn=-1s) cannot be verified', () => {
    const expiredToken = generateToken(1, '-1s');
    expect(() => verifyToken(expiredToken)).toThrow('Invalid or expired token');
  });

  test('userId=0 is encoded correctly', () => {
    const token = generateToken(0);
    const decoded = verifyToken(token);
    expect(decoded.id).toBe(0);
  });

  test('large userId is encoded without precision loss', () => {
    const token = generateToken(999999);
    const decoded = verifyToken(token);
    expect(decoded.id).toBe(999999);
  });
});

// ─────────────────────────────────────────────────────────────
// verifyToken
// ─────────────────────────────────────────────────────────────
describe('verifyToken', () => {
  test('happy path: decodes a freshly generated token and returns correct id', () => {
    const token = generateToken(7);
    const decoded = verifyToken(token);
    expect(decoded).toHaveProperty('id', 7);
  });

  test('decoded payload includes iat (issued-at) timestamp', () => {
    const token = generateToken(1);
    const decoded = verifyToken(token);
    expect(decoded).toHaveProperty('iat');
    expect(typeof decoded.iat).toBe('number');
  });

  test('throws "Invalid or expired token" for a random string', () => {
    expect(() => verifyToken('not.a.jwt')).toThrow('Invalid or expired token');
  });

  test('throws for an empty string', () => {
    expect(() => verifyToken('')).toThrow('Invalid or expired token');
  });

  test('throws for a tampered signature segment', () => {
    const token = generateToken(1);
    const [header, payload] = token.split('.');
    const tampered = `${header}.${payload}.invalidsignature`;
    expect(() => verifyToken(tampered)).toThrow('Invalid or expired token');
  });

  test('throws for a token signed with a different secret', () => {
    const jwt = require('jsonwebtoken');
    const alienToken = jwt.sign({ id: 5 }, 'different-secret', { expiresIn: '1h' });
    expect(() => verifyToken(alienToken)).toThrow('Invalid or expired token');
  });

  test('throws for an expired token', () => {
    const expired = generateToken(1, '-1s');
    expect(() => verifyToken(expired)).toThrow('Invalid or expired token');
  });

  test('throws for a null input', () => {
    expect(() => verifyToken(null)).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────
// generateRandomToken
// ─────────────────────────────────────────────────────────────
describe('generateRandomToken', () => {
  test('returns a string', () => {
    expect(typeof generateRandomToken()).toBe('string');
  });

  test('returns exactly 64 hex characters (32 bytes × 2)', () => {
    expect(generateRandomToken()).toHaveLength(64);
  });

  test('output matches lowercase hex pattern', () => {
    expect(generateRandomToken()).toMatch(/^[a-f0-9]{64}$/);
  });

  test('two consecutive calls produce different tokens', () => {
    const t1 = generateRandomToken();
    const t2 = generateRandomToken();
    expect(t1).not.toBe(t2);
  });

  test('10 generated tokens are all unique', () => {
    const tokens = new Set(Array.from({ length: 10 }, () => generateRandomToken()));
    expect(tokens.size).toBe(10);
  });

  test('never returns an empty string', () => {
    for (let i = 0; i < 5; i++) {
      expect(generateRandomToken().length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// hashToken
// ─────────────────────────────────────────────────────────────
describe('hashToken', () => {
  test('returns a string', () => {
    expect(typeof hashToken('any-token')).toBe('string');
  });

  test('returns a 64-character lowercase hex string (SHA-256 output)', () => {
    const hash = hashToken('test-token');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test('is deterministic: same input always produces the same hash', () => {
    const hash1 = hashToken('same-input');
    const hash2 = hashToken('same-input');
    expect(hash1).toBe(hash2);
  });

  test('different inputs produce different hashes (collision resistance)', () => {
    const hash1 = hashToken('token-alpha');
    const hash2 = hashToken('token-beta');
    expect(hash1).not.toBe(hash2);
  });

  test('handles empty string without throwing', () => {
    const hash = hashToken('');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test('hashing the hash of a token produces a valid hash (chaining)', () => {
    const token = generateRandomToken();
    const hash1 = hashToken(token);
    const hash2 = hashToken(hash1);
    expect(hash2).toHaveLength(64);
    expect(hash2).toMatch(/^[a-f0-9]{64}$/);
    expect(hash1).not.toBe(hash2);
  });

  test('hash of a known value matches the expected SHA-256 digest', () => {
    // SHA-256('abc') = ba7816bf8f01cfea414140de5dae2ec73b00361bbef0469348423f656b44d5b7 (well-known)
    // wait that's SHA-1. SHA-256 of 'abc' is ba7816bf8f01cfea414140de5dae2ec73b00361bbef0469348423f656b44d5b7... let me use Node built-in
    const crypto = require('crypto');
    const expected = crypto.createHash('sha256').update('hello-world').digest('hex');
    expect(hashToken('hello-world')).toBe(expected);
  });
});
