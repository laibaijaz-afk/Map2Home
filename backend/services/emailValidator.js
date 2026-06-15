const dns = require('dns');
const { promisify } = require('util');

const resolveMx = promisify(dns.resolveMx);

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'tempmail.com',
  'temp-mail.org',
  'yopmail.com',
  'yopmail.fr',
  'throwam.com',
  'throwaway.email',
  'sharklasers.com',
  'spam4.me',
  'trashmail.com',
  'trashmail.me',
  'trashmail.net',
  'fakeinbox.com',
  'maildrop.cc',
  'dispostable.com',
  'spamgourmet.com',
  'getairmail.com',
  'mailnull.com',
  'discard.email',
  'tempr.email',
  'cust.in',
  'spamfree24.org',
]);

/**
 * Extracts the domain from an email address.
 * Returns null for any format that isn't exactly one '@'.
 * Throws TypeError if called with null/undefined (caller must pass a string).
 */
const extractDomain = (email) => {
  const parts = email.trim().split('@');
  if (parts.length !== 2) return null;
  return parts[1].toLowerCase();
};

/**
 * Returns true if the domain is a known disposable/temporary email provider.
 */
const isDisposableEmail = (domain) => {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
};

/**
 * Resolves MX records for a domain.
 * Always resolves (never rejects) — DNS errors are returned as { valid: false, error }.
 */
const checkMxRecords = async (domain) => {
  try {
    const records = await resolveMx(domain);
    return {
      valid: records.length > 0,
      mxRecords: records,
    };
  } catch (err) {
    return {
      valid: false,
      error: err.code || err.message,
    };
  }
};

/**
 * Full email existence check: format → disposable blocklist → MX lookup.
 * Returns { isValid, message, details }.
 */
const validateEmailExists = async (email) => {
  const domain = extractDomain(email);

  if (!domain) {
    return {
      isValid: false,
      message: 'Invalid email format',
      details: { reason: 'invalid_format' },
    };
  }

  if (isDisposableEmail(domain)) {
    return {
      isValid: false,
      message: 'Disposable email addresses are not allowed',
      details: { reason: 'disposable_email', domain },
    };
  }

  const mxResult = await checkMxRecords(domain);
  if (!mxResult.valid) {
    return {
      isValid: false,
      message: 'Email domain does not exist or has no mail server configured',
      details: { reason: 'no_mx_records', domain },
    };
  }

  return {
    isValid: true,
    message: 'Email address is valid',
    details: { domain },
  };
};

module.exports = { extractDomain, isDisposableEmail, checkMxRecords, validateEmailExists };
