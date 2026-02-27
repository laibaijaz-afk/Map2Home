/**
 * Email Existence Validator Service
 * 
 * Validates if an email address actually exists by:
 * 1. Checking email format
 * 2. Verifying the domain has valid MX (Mail Exchange) records
 * 
 * This is a production-ready, lightweight solution that doesn't require
 * external paid APIs. For more advanced validation (SMTP verification),
 * you can extend this service or integrate with services like:
 * - ZeroBounce, Hunter.io, NeverBounce, etc.
 */

const dns = require('dns');
const { promisify } = require('util');

// Promisify DNS lookup functions
const resolveMx = promisify(dns.resolveMx);

/**
 * List of known disposable/temporary email domains
 * Add more domains as needed
 */
const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  'throwaway.email',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'fakeinbox.com',
  'trashmail.com',
  'temp-mail.org',
  'getnada.com',
  'dispostable.com',
  'maildrop.cc',
  'yopmail.com',
  'sharklasers.com',
  'guerrillamail.info',
  'grr.la',
  'spam4.me'
];

/**
 * Extract domain from email address
 * @param {string} email - Email address
 * @returns {string} - Domain part of the email
 */
const extractDomain = (email) => {
  const parts = email.toLowerCase().trim().split('@');
  return parts.length === 2 ? parts[1] : null;
};

/**
 * Check if email domain is a known disposable email provider
 * @param {string} domain - Email domain
 * @returns {boolean} - True if disposable
 */
const isDisposableEmail = (domain) => {
  return DISPOSABLE_DOMAINS.includes(domain.toLowerCase());
};

/**
 * Verify if domain has valid MX records (can receive emails)
 * @param {string} domain - Email domain to check
 * @returns {Promise<{valid: boolean, mxRecords: Array}>}
 */
const checkMxRecords = async (domain) => {
  try {
    const mxRecords = await resolveMx(domain);
    
    // Domain has MX records - it can receive emails
    if (mxRecords && mxRecords.length > 0) {
      return {
        valid: true,
        mxRecords: mxRecords.map(mx => ({
          exchange: mx.exchange,
          priority: mx.priority
        }))
      };
    }
    
    return { valid: false, mxRecords: [] };
  } catch (error) {
    // DNS lookup failed - domain doesn't exist or has no MX records
    console.log(`[emailValidator] MX lookup failed for ${domain}:`, error.code || error.message);
    return { valid: false, mxRecords: [], error: error.code };
  }
};

/**
 * Validate if an email address exists
 * @param {string} email - Email address to validate
 * @returns {Promise<{isValid: boolean, message: string, details: object}>}
 */
const validateEmailExists = async (email) => {
  try {
    // Step 1: Extract domain
    const domain = extractDomain(email);
    
    if (!domain) {
      return {
        isValid: false,
        message: 'Invalid email format',
        details: { reason: 'invalid_format' }
      };
    }

    // Step 2: Check for disposable email domains
    if (isDisposableEmail(domain)) {
      return {
        isValid: false,
        message: 'Disposable email addresses are not allowed. Please use a permanent email.',
        details: { reason: 'disposable_email', domain }
      };
    }

    // Step 3: Check MX records
    const mxResult = await checkMxRecords(domain);
    
    if (!mxResult.valid) {
      return {
        isValid: false,
        message: 'This email address does not exist. Please enter a valid email.',
        details: { 
          reason: 'no_mx_records', 
          domain,
          dnsError: mxResult.error 
        }
      };
    }

    // Email domain is valid and can receive emails
    return {
      isValid: true,
      message: 'Email address is valid',
      details: {
        domain,
        mxRecords: mxResult.mxRecords
      }
    };

  } catch (error) {
    console.error('[emailValidator] Unexpected error:', error);
    // In case of unexpected errors, allow the email (fail-open)
    // You can change this to fail-closed if preferred
    return {
      isValid: true,
      message: 'Email validation skipped due to error',
      details: { reason: 'validation_error', error: error.message }
    };
  }
};

module.exports = {
  validateEmailExists,
  extractDomain,
  isDisposableEmail,
  checkMxRecords
};
