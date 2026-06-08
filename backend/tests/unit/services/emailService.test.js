// Mock the sendEmail module so no real SMTP connections are made.
// emailService.js does: const sendEmail = require('./sendEmail')
// Both paths resolve to the same absolute file, so Jest intercepts it.
jest.mock('../../../services/sendEmail', () => jest.fn());

const sendEmail = require('../../../services/sendEmail');
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
} = require('../../../services/emailService');

beforeEach(() => {
  jest.clearAllMocks();
  sendEmail.mockResolvedValue(undefined); // default: email sends successfully
  // Provide predictable env vars
  process.env.VERIFICATION_URL = 'http://localhost:5173/verify-email?token=';
  process.env.FRONTEND_URL = 'http://localhost:5173';
});

// ─────────────────────────────────────────────────────────────
// sendVerificationEmail
// ─────────────────────────────────────────────────────────────
describe('sendVerificationEmail', () => {
  test('happy path: calls sendEmail with the correct recipient and subject', async () => {
    await sendVerificationEmail({ name: 'Alice', email: 'alice@example.com' }, 'tok123');

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      'alice@example.com',
      'Verify your email',
      expect.any(String)
    );
  });

  test('HTML body contains the token in the verification link', async () => {
    await sendVerificationEmail({ name: 'Bob', email: 'bob@example.com' }, 'secret-token-abc');

    const html = sendEmail.mock.calls[0][2];
    expect(html).toContain('secret-token-abc');
  });

  test('HTML body contains the user name', async () => {
    await sendVerificationEmail({ name: 'Carol', email: 'carol@example.com' }, 'tok');

    const html = sendEmail.mock.calls[0][2];
    expect(html).toContain('Carol');
  });

  test('escapes dangerous HTML in user name (XSS prevention via escapeHtml)', async () => {
    await sendVerificationEmail({ name: '<script>alert(1)</script>', email: 'x@example.com' }, 'tok');

    const html = sendEmail.mock.calls[0][2];
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  test('uses email address as display name when name is absent', async () => {
    await sendVerificationEmail({ email: 'noname@example.com' }, 'tok');

    const html = sendEmail.mock.calls[0][2];
    expect(html).toContain('noname@example.com');
  });

  test('throws with descriptive message when user is null', async () => {
    await expect(sendVerificationEmail(null, 'tok')).rejects.toThrow(
      'sendVerificationEmail: invalid user or missing email'
    );
  });

  test('throws with descriptive message when user.email is missing', async () => {
    await expect(sendVerificationEmail({ name: 'Test' }, 'tok')).rejects.toThrow(
      'sendVerificationEmail: invalid user or missing email'
    );
  });

  test('wraps sendEmail errors with a descriptive message', async () => {
    sendEmail.mockRejectedValue(new Error('SMTP connection refused'));

    await expect(
      sendVerificationEmail({ name: 'User', email: 'u@example.com' }, 'tok')
    ).rejects.toThrow('Failed to send verification email: SMTP connection refused');
  });

  test('HTML includes a clickable anchor tag with the verification URL', async () => {
    await sendVerificationEmail({ name: 'Dave', email: 'd@example.com' }, 'mytoken');

    const html = sendEmail.mock.calls[0][2];
    expect(html).toContain('<a ');
    expect(html).toContain('mytoken');
  });

  test('token is URL-encoded in the verification link (handles special chars)', async () => {
    await sendVerificationEmail({ name: 'Eve', email: 'e@example.com' }, 'tok+en/special');

    const html = sendEmail.mock.calls[0][2];
    // encodeURIComponent encodes + and /
    expect(html).toContain('tok%2Ben%2Fspecial');
  });
});

// ─────────────────────────────────────────────────────────────
// sendWelcomeEmail
// ─────────────────────────────────────────────────────────────
describe('sendWelcomeEmail', () => {
  test('happy path: calls sendEmail with correct recipient and subject', async () => {
    await sendWelcomeEmail({ name: 'Frank', email: 'frank@example.com' });

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      'frank@example.com',
      'Welcome to Map2Home',
      expect.any(String)
    );
  });

  test('HTML body contains the Map2Home branding', async () => {
    await sendWelcomeEmail({ name: 'Grace', email: 'grace@example.com' });

    const html = sendEmail.mock.calls[0][2];
    expect(html).toContain('Map2Home');