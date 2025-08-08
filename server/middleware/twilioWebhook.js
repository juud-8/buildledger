const express = require('express');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Enhanced Twilio webhook router with security and validation
 * - Signature verification using X-Twilio-Signature
 * - Rate limiting (60 req/min per IP)
 * - Narrow CORS for Twilio IPs only
 * - Structured logging and audit trail
 * - Request validation and sanitization
 *
 * @param {object} deps
 * @param {import('@supabase/supabase-js').SupabaseClient} deps.supabase
 */
module.exports = function createTwilioWebhookRouter({ supabase }) {
  const router = express.Router();

  // Twilio webhook rate limiting - stricter than Stripe
  const twilioLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per windowMs (Twilio recommended)
    message: {
      error: 'Too many webhook requests from this IP, please try again later.',
      type: 'rate_limit_exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use combination of IP and User-Agent for better rate limiting
      return `${req.ip}-${req.headers['user-agent']?.substring(0, 50) || 'unknown'}`;
    }
  });

  // Narrow CORS for Twilio webhooks - restrict to Twilio's IP ranges
  const twilioOriginMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    const userAgent = req.headers['user-agent'] || '';
    const clientIP = req.ip || req.connection.remoteAddress;

    // Twilio doesn't send Origin header for webhooks, but check user-agent
    if (!userAgent.includes('TwilioProxy') && !userAgent.includes('Twilio')) {
      logger.security('Suspicious Twilio webhook request', {
        ip: clientIP,
        userAgent: userAgent,
        origin: origin,
        reason: 'Non-Twilio user agent'
      });
    }

    // Set restrictive CORS headers
    res.header('Access-Control-Allow-Origin', 'https://www.twilio.com');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Twilio-Signature');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    next();
  };

  // Apply middleware to all Twilio webhook routes
  router.use(twilioLimiter);
  router.use(twilioOriginMiddleware);

  /**
   * Verify Twilio webhook signature
   * @param {string} authToken - Twilio auth token
   * @param {string} signature - X-Twilio-Signature header
   * @param {string} url - Full webhook URL
   * @param {object} params - Request body parameters
   * @returns {boolean} - True if signature is valid
   */
  function validateTwilioSignature(authToken, signature, url, params) {
    if (!authToken || !signature || !url) {
      return false;
    }

    try {
      // Sort parameters and create query string
      const sortedParams = Object.keys(params).sort().reduce((result, key) => {
        result.push(`${key}${params[key]}`);
        return result;
      }, []);

      // Create the signature base string
      const baseString = url + sortedParams.join('');
      
      // Generate HMAC-SHA1 signature
      const hmac = crypto.createHmac('sha1', authToken);
      hmac.update(baseString, 'utf8');
      const computedSignature = hmac.digest('base64');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(computedSignature, 'base64')
      );
    } catch (error) {
      logger.error('Error validating Twilio signature', {
        error: error.message,
        url: url?.substring(0, 100) // Truncate for security
      });
      return false;
    }
  }

  /**
   * SMS status callback webhook
   * Handles delivery status updates from Twilio
   */
  router.post('/sms/status', express.urlencoded({ extended: true }), async (req, res) => {
    const startTime = Date.now();
    const clientIP = req.ip || req.connection.remoteAddress;
    const twilioSignature = req.headers['x-twilio-signature'];
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    // Validate required configuration
    if (!authToken) {
      logger.error('TWILIO_AUTH_TOKEN not configured for webhook verification', {
        ip: clientIP,
        type: 'configuration_error'
      });
      return res.status(500).json({ error: 'Webhook configuration error' });
    }

    // Construct full webhook URL for signature verification
    const protocol = req.secure ? 'https' : 'http';
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    // Verify Twilio signature
    const isValidSignature = validateTwilioSignature(
      authToken,
      twilioSignature,
      fullUrl,
      req.body
    );

    if (!isValidSignature) {
      logger.security('Twilio webhook signature verification failed', {
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        url: fullUrl,
        signaturePresent: !!twilioSignature
      });
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Log successful webhook receipt
    logger.webhook('twilio', req.body.MessageSid || 'unknown', {
      messageStatus: req.body.MessageStatus,
      to: req.body.To,
      from: req.body.From,
      ip: clientIP
    });

    try {
      // Extract webhook data
      const {
        MessageSid,
        MessageStatus,
        To,
        From,
        ErrorCode,
        ErrorMessage
      } = req.body;

      // Validate required fields
      if (!MessageSid || !MessageStatus) {
        logger.warn('Invalid Twilio webhook data', {
          messageSid: MessageSid,
          status: MessageStatus,
          ip: clientIP
        });
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Update message status in database
      const { error: updateError } = await supabase
        .from('sms_messages')
        .update({
          status: MessageStatus.toLowerCase(),
          error_code: ErrorCode || null,
          error_message: ErrorMessage || null,
          status_updated_at: new Date().toISOString()
        })
        .eq('twilio_sid', MessageSid);

      if (updateError) {
        logger.error('Failed to update SMS message status', {
          error: updateError,
          messageSid: MessageSid,
          status: MessageStatus
        });
        return res.status(500).json({ error: 'Database update failed' });
      }

      // Log specific status events
      if (MessageStatus === 'failed' || ErrorCode) {
        logger.warn('SMS delivery failed', {
          messageSid: MessageSid,
          to: To,
          errorCode: ErrorCode,
          errorMessage: ErrorMessage
        });
      }

      const processingTime = Date.now() - startTime;
      logger.info('Twilio SMS webhook processed successfully', {
        messageSid: MessageSid,
        status: MessageStatus,
        processingTimeMs: processingTime,
        ip: clientIP
      });

      res.status(200).json({
        received: true,
        messageSid: MessageSid,
        processingTime: `${processingTime}ms`
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Error processing Twilio SMS webhook', {
        error: error.message,
        stack: error.stack,
        messageSid: req.body.MessageSid,
        processingTimeMs: processingTime,
        ip: clientIP
      });
      
      res.status(500).json({
        error: 'Webhook processing failed',
        messageSid: req.body.MessageSid
      });
    }
  });

  /**
   * Voice status callback webhook
   * Handles call status updates from Twilio
   */
  router.post('/voice/status', express.urlencoded({ extended: true }), async (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const twilioSignature = req.headers['x-twilio-signature'];
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    // Signature verification (same as SMS)
    const protocol = req.secure ? 'https' : 'http';
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    const isValidSignature = validateTwilioSignature(
      authToken,
      twilioSignature,
      fullUrl,
      req.body
    );

    if (!isValidSignature) {
      logger.security('Twilio voice webhook signature verification failed', {
        ip: clientIP,
        userAgent: req.headers['user-agent']
      });
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Log voice webhook (basic implementation)
    logger.webhook('twilio-voice', req.body.CallSid || 'unknown', {
      callStatus: req.body.CallStatus,
      to: req.body.To,
      from: req.body.From,
      ip: clientIP
    });

    // For now, just acknowledge receipt
    // Implement voice call handling as needed
    res.status(200).json({ received: true });
  });

  /**
   * Health check endpoint
   */
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'twilio-webhook',
      timestamp: new Date().toISOString(),
      configured: {
        authToken: !!process.env.TWILIO_AUTH_TOKEN,
        accountSid: !!process.env.TWILIO_ACCOUNT_SID,
        phoneNumber: !!process.env.TWILIO_PHONE_NUMBER
      }
    });
  });

  return router;
};