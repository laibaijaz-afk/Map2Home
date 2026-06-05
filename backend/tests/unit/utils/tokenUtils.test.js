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