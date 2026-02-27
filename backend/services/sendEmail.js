const nodemailer = require('nodemailer')
const dotenv = require('dotenv')

dotenv.config()

// Create Gmail transporter using App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Verify transporter at startup to surface auth/connectivity problems early
transporter.verify((err, success) => {
  if (err) {
    console.error('[sendEmail] transporter verification failed:', err && err.message ? err.message : err)
    if (err && err.code === 'EAUTH') {
      console.error('[sendEmail] Authentication failed (EAUTH). Troubleshooting tips:')
      console.error(" - Ensure `EMAIL_USER` is the full Gmail address (e.g. 'you@gmail.com').")
      console.error(" - Ensure `EMAIL_PASS` is a 16-character Gmail App Password (not your normal account password).")
      console.error(" - App Passwords require 2-Step Verification; enable it in your Google account settings.")
      console.error(" - If this is a Google Workspace account, the admin may need to allow SMTP or App Passwords.")
      console.error(" - See: https://support.google.com/mail/?p=BadCredentials and https://support.google.com/accounts/answer/185833")
    }
  } else {
    console.log('[sendEmail] transporter is ready to send messages')
  }
})

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.response)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

module.exports = sendEmail
