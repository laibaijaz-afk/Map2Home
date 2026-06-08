const { validatePassword, calculatePasswordStrength } = require('../../../utils/passwordValidator');

// ─────────────────────────────────────────────────────────────
// validatePassword
// ─────────────────────────────────────────────────────────────
describe('validatePassword', () => {
  test('happy path: valid password returns isValid true with no errors', () => {
    const result = validatePassword('StrongP@ss1');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('happy path: returns a strength property alongside validation result', () => {
    const result = validatePassword('StrongP@ss1');
    expect(result).toHaveProperty('strength');
    expect(typeof result.strength).toBe('string');
  });

  test('fails when password is shorter than 8 characters', () => {
    const result = validatePassword('Ab1@');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
  });

  test('boundary: exactly 7 characters fails length check', () => {
    const result = validatePassword('Ab1@cde');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
  });

  test('boundary: exactly 8 characters with all requirements passes', () => {
    const result = validatePassword('Abc12@de');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('fails when no uppercase letter present', () => {
    const result = validatePassword('lowercase1@aa');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  test('fails when no lowercase letter present', () => {
    const result = validatePassword('UPPERCASE1@AA');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  });

  test('fails when no digit present', () => {
    const result = validatePassword('NoNumbers@ABcd');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });

  test('fails when no special character present', () => {
    const result = validatePassword('NoSpecial1ABcd');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one special character (!@#$%^&*)'
    );
  });

  test('empty string accumulates all 5 error messages', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(5);
  });

  test('multiple failures produce multiple error messages', () => {
    // missing uppercase, number, special char but long enough
    const result = validatePassword('alllowercase');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  test('each allowed special character individually satisfies the requirement', () => {
    const specials = ['!', '@', '#', '$', '%', '^', '&', '*'];
    specials.forEach((char) => {
      const result = validatePassword(`StrongP${char}ss1`);
      expect(result.isValid).toBe(true);
    });
  });

  test('password with only spaces fails (too short and no criteria met)', () => {
    const result = validatePassword('        '); // 8 spaces
    expect(result.isValid).toBe(false);
    // spaces don't satisfy uppercase / lowercase / number / special
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('very long valid password is accepted', () => {
    const result = validatePassword('MyVeryL0ng&SecurePassword!ForTesting');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────
// calculatePasswordStrength
// ─────────────────────────────────────────────────────────────
describe('calculatePasswordStrength', () => {
  // Scoring: +1 each for length≥8, length≥12, uppercase, lowercase, number, special
  // levels = ['Very Weak'(1), 'Weak'(2), 'Fair'(3), 'Good'(4), 'Strong'(5), 'Very Strong'(6)]
  // strength=0 → 'Very Weak' (via the `|| 'Very Weak'` fallback)

  test('empty string returns Very Weak', () => {
    expect(calculatePasswordStrength('')).toBe('Very Weak');
  });

  test('single lowercase letter returns Very Weak (strength=1 → index 0)', () => {
    // length<8 → 0, has lowercase → 1, total=1
    expect(calculatePasswordStrength('a')).toBe('Very Weak');
  });

  test('8+ chars with only mixed case returns Weak (strength=2)', () => {
    // length≥8 → 1, uppercase → 1, lowercase → 1, no number, no special → 3 = Fair
    // actually: length>=8(1) + uppercase(1) + lowercase(1) = 3 → 'Fair'
    expect(calculatePasswordStrength('AbcdefghAB')).toBe('Fair');
  });

  test('8+ chars with letters only (same case) returns Weak (strength=2)', () => {
    // length≥8 → 1, lowercase only → 1 = strength 2 → 'Weak'
    expect(calculatePasswordStrength('abcdefgh')).toBe('Weak');
  });

  test('8-char password meeting all 5 criteria returns Strong (strength=5)', () => {
    // length≥8(1) + uppercase(1) + lowercase(1) + number(1) + special(1) = 5 → 'Strong'
    expect(calculatePasswordStrength('Abc12@de')).toBe('Strong');
  });

  test('12+ char password meeting all criteria returns Very Strong (strength=6)', () => {
    // length≥8(1) + length≥12(1) + uppercase(1) + lowercase(1) + number(1) + special(1) = 6
    expect(calculatePasswordStrength('Abcdef1234@A')).toBe('Very Strong');
  });

  test('password between 8 and 11 chars with all criteria returns Strong, not Very Strong', () => {
    const result = calculatePasswordStrength('Abc1@defG'); // 9 chars
    expect(result).toBe('Strong');
    expect(result).not.toBe('Very Strong');
  });

  test('number-only string under 8 chars returns Very Weak', () => {
    // length<8 → 0, number → 1, total=1 → 'Very Weak'
    expect(calculatePasswordStrength('123')).toBe('Very Weak');
  });

  test('returns one of the 6 defined strength levels', () => {
    const validLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const passwords = ['', 'a', 'abcdefgh', 'Abcdefgh', 'Abc12@de', 'Abcdef1234@A'];
    passwords.forEach((pwd) => {
      expect(validLevels).toContain(calculatePasswordStrength(pwd));
    });
  });

  test('special characters in the allowed set contribute to strength', () => {
    // Without special → strength 4 ('Good'), with special → strength 5 ('Strong')
    const withoutSpecial = calculatePasswordStrength('Abcdefg1');
    const withSpecial    = calculatePasswordStrength('Abcdefg1@');
    // withSpecial should rank higher (or at least not lower)
    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    expect(levels.indexOf(withSpecial)).toBeGreaterThan(levels.indexOf(withoutSpecial));
  });
});
