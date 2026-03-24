const sendEmail = require('./sendEmail');

function buildFrontendUrl(path = '') {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${base.replace(/\/$/, '')}${path ? `/${path.replace(/^\//, '')}` : ''}`;
}

function escapeHtml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendVerificationEmail(user, token) {
  if (!user || !user.email) {
    throw new Error('sendVerificationEmail: invalid user or missing email');
  }

  // Build frontend verification link using VERIFICATION_URL from environment
  const verificationUrlBase = process.env.VERIFICATION_URL || 'http://localhost:5173/verify-email?token=';
  const link = `${verificationUrlBase}${encodeURIComponent(token)}`;

  console.log(`sendVerificationEmail called for: ${user.email}`);
  console.log(`Verification link: ${link}`);

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111;">
      <h2 style="color:#0b5ed7; margin-bottom:0.2rem;">Verify your email</h2>
      <p>Hi ${escapeHtml(user.name || user.email)},</p>
      <p>Thanks for registering. Please click the button below to verify your email address. This link will expire in 24 hours.</p>
      <p style="margin: 1.2rem 0;">
        <a href="${link}" style="background:#0b5ed7;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;">
          Verify Email
        </a>
      </p>
      <p>If the button doesn't work, paste this URL into your browser:</p>
      <p style="word-break:break-all;"><a href="${link}">${link}</a></p>
      <hr />
      <small>If you didn't create an account, ignore this email.</small>
    </div>
  `;

  const subject = 'Verify your email';
  try {
    await sendEmail(user.email, subject, html);
    console.log(`Verification email sent to: ${user.email}`);
  } catch (err) {
    throw new Error(`Failed to send verification email: ${err.message}`);
  }
}

async function sendWelcomeEmail(user) {
  if (!user || !user.email) {
    throw new Error('sendWelcomeEmail: invalid user or missing email');
  }

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111;">
      <h2 style="color:#0b5ed7; margin-bottom:0.2rem;">Welcome to Map2Home</h2>
      <p>Hi ${escapeHtml(user.name || user.email)},</p>
      <p>Your email has been successfully verified. You can now sign in and start using your account.</p>
      <p>If you need help, reply to this email (if supported) or contact support through the app.</p>
      <hr />
      <small>Thanks — The Map2Home team</small>
    </div>
  `;

  const subject = 'Welcome to Map2Home';
  try {
    await sendEmail(user.email, subject, html);
  } catch (err) {
    console.error('Failed to send welcome email:', err);
  }
}

async function sendResetPasswordEmail(email, token, userName) {
  if (!email) {
    throw new Error('sendResetPasswordEmail: missing email');
  }

  const resetUrlBase = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${resetUrlBase.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111;">
      <h2 style="color:#0b5ed7; margin-bottom:0.2rem;">Reset your password</h2>
      <p>Hi ${escapeHtml(userName || email)},</p>
      <p>We received a request to reset your password. Click the button below to set a new password. This link will expire in 24 hours.</p>
      <p style="margin: 1.2rem 0;">
        <a href="${resetLink}" style="background:#0b5ed7;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;">
          Reset Password
        </a>
      </p>
      <p>If the button doesn't work, paste this URL into your browser:</p>
      <p style="word-break:break-all;"><a href="${resetLink}">${resetLink}</a></p>
      <hr />
      <small>If you didn't request this, ignore this email.</small>
    </div>
  `;

  const subject = 'Reset your password';
  try {
    await sendEmail(email, subject, html);
    console.log('[emailService.sendResetPasswordEmail] sent reset email to', email);
  } catch (err) {
    console.error('[emailService.sendResetPasswordEmail] error:', err.message);
    throw err;
  }
}

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
};
