const sendEmail = require('./sendEmail');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function buildVerificationHtml(displayName, verificationLink) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
  <h2 style="color:#2563eb">Map2Home &mdash; Verify Your Email</h2>
  <p>Hi ${displayName},</p>
  <p>Thank you for signing up for Map2Home. Click the button below to verify your email address.</p>
  <p style="text-align:center;margin:32px 0">
    <a href="${verificationLink}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
      Verify Email
    </a>
  </p>
  <p>Or copy and paste this link into your browser:</p>
  <p style="word-break:break-all;color:#2563eb">${verificationLink}</p>
  <p style="color:#888;font-size:13px">This link expires in 24 hours.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="font-size:12px;color:#aaa">Map2Home &mdash; Your home planning companion</p>
</body>
</html>`;
}

function buildWelcomeHtml(displayName) {
  const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
  <h2 style="color:#2563eb">Welcome to Map2Home!</h2>
  <p>Hi ${displayName},</p>
  <p>Your email has been verified and your Map2Home account is all set.</p>
  <p>Start designing floor plans, estimating construction costs, and bringing your dream home to life.</p>
  <p style="text-align:center;margin:32px 0">
    <a href="${appUrl}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
      Go to Map2Home
    </a>
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="font-size:12px;color:#aaa">Map2Home &mdash; Your home planning companion</p>
</body>
</html>`;
}

function buildResetHtml(displayName, resetLink) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
  <h2 style="color:#2563eb">Map2Home &mdash; Reset Your Password</h2>
  <p>Hi ${displayName},</p>
  <p>We received a request to reset your Map2Home password. Click the button below to choose a new one.</p>
  <p style="text-align:center;margin:32px 0">
    <a href="${resetLink}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
      Reset Password
    </a>
  </p>
  <p>Or copy and paste this link into your browser:</p>
  <p style="word-break:break-all;color:#2563eb">${resetLink}</p>
  <p style="color:#888;font-size:13px">This link expires in 24 hours. If you did not request a password reset, you can safely ignore this email.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="font-size:12px;color:#aaa">Map2Home &mdash; Your home planning companion</p>
</body>
</html>`;
}

const sendVerificationEmail = async (user, token) => {
  if (!user || !user.email) {
    throw new Error('sendVerificationEmail: invalid user or missing email');
  }
  const displayName = escapeHtml(user.name || user.email);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationLink = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const html = buildVerificationHtml(displayName, verificationLink);
  try {
    await sendEmail(user.email, 'Verify your email', html);
  } catch (err) {
    throw new Error(`Failed to send verification email: ${err.message}`);
  }
};

const sendWelcomeEmail = async (user) => {
  if (!user || !user.email) {
    throw new Error('sendWelcomeEmail: invalid user or missing email');
  }
  const displayName = escapeHtml(user.name || user.email);
  const html = buildWelcomeHtml(displayName);
  try {
    await sendEmail(user.email, 'Welcome to Map2Home', html);
  } catch (err) {
    console.error('[emailService.sendWelcomeEmail] failed (non-critical):', err.message);
  }
};

const sendResetPasswordEmail = async (email, token, userName) => {
  if (!email) {
    throw new Error('sendResetPasswordEmail: missing email');
  }
  const displayName = escapeHtml(userName || email);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const html = buildResetHtml(displayName, resetLink);
  await sendEmail(email, 'Reset your password', html);
};

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail };
