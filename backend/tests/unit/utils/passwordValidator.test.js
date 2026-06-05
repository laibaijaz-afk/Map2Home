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