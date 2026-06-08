// Mock the 'dns' module BEFORE anything else is required.
// jest.mock is hoisted, so dns.resolveMx will be a jest.fn() when
// emailValidator.js calls promisify(dns.resolveMx) at load time.
jest.mock('dns', () => ({
  resolveMx: jest.fn(),
}));

const dns = require('dns');
const {
  extractDomain,
  isDisposableEmail,
  checkMxRecords,
  validateEmailExists,
} = require('../../../services/emailValidator');

// ─────────────────────────────────────────────────────────────
// extractDomain
// ─────────────────────────────────────────────────────────────
describe('extractDomain', () => {
  test('happy path: extracts domain from a standard email', () => {
    expect(extractDomain('user@example.com')).toBe('example.com');
  });

  test('converts the domain to lowercase', () => {
    expect(extractDomain('User@EXAMPLE.COM')).toBe('example.com');
  });

  test('trims surrounding whitespace before parsing', () => {
    expect(extractDomain('  user@example.com  ')).toBe('example.com');
  });

  test('returns null when there is no @ symbol', () => {
    expect(extractDomain('notanemail')).toBeNull();
  });

  test('returns null for an empty string', () => {
    expect(extractDomain('')).toBeNull();
  });

  test('returns null when there are two @ symbols (invalid format)', () => {
    // 'a@b@c'.split('@') → ['a','b','c'] (length 3, not 2)
    expect(extractDomain('a@b@c')).toBeNull();
  });

  test('handles sub-domain addresses correctly', () => {
    expect(extractDomain('user@mail.company.co.uk')).toBe('mail.company.co.uk');
  });

  test('throws TypeError when called with null (documents the contract boundary)', () => {
    expect(() => extractDomain(null)).toThrow(TypeError);
  });
});

// ─────────────────────────────────────────────────────────────
// isDisposableEmail
// ─────────────────────────────────────────────────────────────
describe('isDisposableEmail', () => {
  test('happy path: returns false for a real domain like gmail.com', () => {
    expect(isDisposableEmail('gmail.com')).toBe(false);
  });

  test('returns true for mailinator.com (known disposable)', () => {
    expect(isDisposableEmail('mailinator.com')).toBe(true);
  });

  test('returns true for guerrillamail.com (known disposable)', () => {
    expect(isDisposableEmail('guerrillamail.com')).toBe(true);
  });

  test('returns true for tempmail.com (known disposable)', () => {
    expect(isDisposableEmail('tempmail.com')).toBe(true);
  });

  test('returns true for yopmail.com (known disposable)', () => {
    expect(isDisposableEmail('yopmail.com')).toBe(true);
  });

  test('returns false for outlook.com (legitimate provider)', () => {
    expect(isDisposableEmail('outlook.com')).toBe(false);
  });

  test('is case-insensitive for the domain check', () => {
    expect(isDisposableEmail('MAILINATOR.COM')).toBe(true);
    expect(isDisposableEmail('Tempmail.Com')).toBe(true);
  });

  test('returns false for an unknown/random domain', () => {
    expect(isDisposableEmail('totallylegitimatebusiness.io')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// checkMxRecords
// ─────────────────────────────────────────────────────────────
describe('checkMxRecords', () => {
  beforeEach(() => {
    dns.resolveMx.mockReset();
  });

  test('happy path: returns valid:true and mxRecords array when DNS resolves', async () => {
    dns.resolveMx.mockImplementation((domain, cb) => {
      cb(null, [{ exchange: 'mx.gmail.com', priority: 10 }]);
    });

    const result = await checkMxRecords('gmail.com');
    expect(result.valid).toBe(true);
    expect(result.mxRecords).toHaveLength(1);
    expect(result.mxRecords[0]).toEqual({ exchange: 'mx.gmail.com', priority: 10 });
  });

  test('returns valid:false when DNS returns an empty MX array', async () => {
    dns.resolveMx.mockImplementation((domain, cb) => {
      cb(null, []);
    });

    const result = await checkMxRecords('nodomain.example');
    expect(result.valid).toBe(false);
    expect(result.mxRecords).toHaveLength(0);
  });

  test('returns valid:false when DNS lookup fails with ENOTFOUND', async () => {
    dns.resolveMx.mockImplementation((domain, cb) => {
      const err = new Error('ENOTFOUND');
      err.code = 'ENOTFOUND';
      cb(err);
    });

    const result = await checkMxRecords('nonexistent.xyz');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('ENOTFOUND');
  });

  test('returns valid:false and captures error code on DNS failure', async () => {
    dns.resolveMx.mockImplementation((domain, cb) => {
      const err = new Error('ESERVFAIL');
      err.code = 'ESERVFAIL';
      cb(err);
    });

    const result = await checkMxRecords('fail.example');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('ESERVFAIL');
  });

  test('maps multiple MX records and preserves exchange/priority', async () => {
    dns.resolveMx.mockImplementation((domain, cb) => {
      cb(null, [
        { exchange: 'mx1.example.com', priority: 10 },
        { exchange: 'mx2.example.com', priority: 20 },
      ]);
    });

    const result = await checkMxRecords('example.com');
    expect(result.valid).toBe(true);
    expect(result.mxRecords).toHaveLength(2);
    expect(result.mxRecords[1].exchange).toBe('mx2.example.com');
  });

  test('does not throw — always resolves the promise even on DNS errors', async () => {
    dns.resolveMx.mockImplementation((domain, cb) => {
      cb(new Error('Network failure'));
    });

    await expect(checkMxRecords('broken.net')).resolves.toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────
// validateEmailExists
// ─────────────────────────────────────────────────────────────
describe('validateEmailExists', () => {
  beforeEach(() => {
    dns.resolveMx.mockReset();
  });

  test('happy path: valid email with working MX record returns isValid:true', async () => {
    dns.resolveMx.mockImplementation((domain, cb) => {
      cb(null, [{ exchange: 'mx.gmail.com', priority: 10 }]);
    });

    const result = await validateEmailExists('user@gmail.com');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('Email address is valid');
  });

  test('returns isValid:false for email without @ (invalid format)', async () => {
    const result = await validateEmailExists('notanemail');
    expect(result.isValid).toBe(false);
    expect(result.details.reason).toBe('invalid_format');
  });

  test('returns isValid:false for a disposable email domain', async () => {
    const result = await validateEmailExists('user@mailinator.com');
    expect(result.isValid).toBe(false);
    expect(result.details.reason).toBe('disposable_email');
  });

  test('returns isValid:false when domain has no MX records', async () => {
    dns.resolveMx.mockImplementation((domain, cb) => {
      const err = new Error('ENOTFOUND');
      err.code = 'ENOTFOUND';
      cb(err);
    });

    const result = await validateEmailExists('user@fakexyz123.com');
    expect(result.isValid).toBe(false);
    expect(result.details.reason).toBe('no_mx_records');
  });

  test('returns correct domain in details for a valid email', async () => {
    dns.resolveMx.mockImplementation((domain, cb) => {
      cb(null, [{ exchange: 'mx.yahoo.com', priority: 10 }]);
    });

    const result = await validateEmailExists('user@yahoo.com');
    expect(result.details.domain).toBe('yahoo.com');
  });

  test('fails fast on disposable domain without any DNS call', async () => {
    await validateEmailExists('user@tempmail.com');
    expect(dns.resolveMx).not.toHaveBeenCalled();
  });

  test('always returns an object with isValid, message, and details keys', async () => {
    dns.resolveMx.mockImplementation((domain, cb) => {
      cb(null, [{ exchange: 'mx.test.com', priority: 1 }]);
    });

    const result = await validateEmailExists('user@test.com');
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('details');
  });

  test('returns isValid:false message for a non-existent TLD', async () => {
    dns.resolveMx.mockImplementation((domain, cb) => {
      const err = new Error('ENOTFOUND');
      err.code = 'ENOTFOUND';
      cb(err);
    });

    const result = await validateEmailExists('user@completelynonexistent.invalid');
    expect(result.isValid).toBe(false);
    expect(result.message).toMatch(/does not exist|no_mx/i);
  });
});
