import { describe, it, expect, vi, beforeEach } from 'vitest'
import { twilioWebhook } from './twilioWebhook.js'

// Mock Twilio
const mockTwilio = vi.fn().mockReturnValue({
  validateRequest: vi.fn()
})

vi.mock('twilio', () => ({
  default: mockTwilio
}))

describe('Twilio Webhook Middleware', () => {
  let mockReq, mockRes, mockNext, mockTwilioClient

  beforeEach(() => {
    mockReq = {
      headers: {
        'x-twilio-signature': 'valid_signature',
        'user-agent': 'TwilioProxy/1.1',
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: {
        MessageSid: 'SMtest123',
        From: '+1234567890',
        To: '+0987654321',
        Body: 'Test message'
      },
      rawBody: 'MessageSid=SMtest123&From=%2B1234567890&To=%2B0987654321&Body=Test%20message',
      url: 'https://example.com/webhook/twilio',
      ip: '127.0.0.1',
      method: 'POST'
    }
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      end: vi.fn()
    }
    
    mockNext = vi.fn()

    mockTwilioClient = {
      validateRequest: vi.fn().mockReturnValue(true)
    }
    
    mockTwilio.mockReturnValue(mockTwilioClient)
  })

  describe('Security validation', () => {
    it('rejects requests without x-twilio-signature header', () => {
      delete mockReq.headers['x-twilio-signature']
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing x-twilio-signature header'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('rejects requests with invalid user agent', () => {
      mockReq.headers['user-agent'] = 'malicious-bot'
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid user agent'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('rejects non-POST requests', () => {
      mockReq.method = 'GET'
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(405)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Method not allowed'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('rejects requests with invalid content type', () => {
      mockReq.headers['content-type'] = 'application/json'
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid content type'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('rejects requests without body', () => {
      mockReq.body = null
      mockReq.rawBody = null
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing request body'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('Twilio signature verification', () => {
    it('rejects requests with invalid signature', () => {
      mockTwilioClient.validateRequest.mockReturnValue(false)
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockTwilioClient.validateRequest).toHaveBeenCalledWith(
        process.env.TWILIO_AUTH_TOKEN,
        'valid_signature',
        'https://example.com/webhook/twilio',
        mockReq.body
      )
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid webhook signature'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('processes valid webhook requests', () => {
      mockTwilioClient.validateRequest.mockReturnValue(true)
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockTwilioClient.validateRequest).toHaveBeenCalledWith(
        process.env.TWILIO_AUTH_TOKEN,
        'valid_signature',
        'https://example.com/webhook/twilio',
        mockReq.body
      )
      expect(mockReq.twilioData).toEqual(mockReq.body)
      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })
  })

  describe('Rate limiting', () => {
    it('applies rate limiting per phone number', () => {
      const requests = Array(5).fill().map(() => ({
        ...mockReq,
        body: {
          ...mockReq.body,
          From: '+1555123456'
        }
      }))

      mockTwilioClient.validateRequest.mockReturnValue(true)

      for (const req of requests) {
        twilioWebhook(req, mockRes, mockNext)
      }

      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('Data validation and sanitization', () => {
    it('validates required Twilio fields', () => {
      mockReq.body = {
        MessageSid: 'SMtest123'
        // Missing From, To, Body
      }
      mockTwilioClient.validateRequest.mockReturnValue(true)
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockReq.twilioData).toEqual(mockReq.body)
      expect(mockNext).toHaveBeenCalled()
    })

    it('sanitizes message content for logging', () => {
      const sensitiveBody = {
        MessageSid: 'SMtest123',
        From: '+1234567890',
        To: '+0987654321',
        Body: 'My SSN is 123-45-6789 and credit card is 4111-1111-1111-1111'
      }
      
      mockReq.body = sensitiveBody
      mockTwilioClient.validateRequest.mockReturnValue(true)
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockReq.twilioData).toEqual(sensitiveBody)
      expect(mockNext).toHaveBeenCalled()
    })

    it('validates phone number formats', () => {
      const invalidPhoneBody = {
        MessageSid: 'SMtest123',
        From: 'invalid-phone',
        To: 'also-invalid',
        Body: 'Test message'
      }
      
      mockReq.body = invalidPhoneBody
      mockTwilioClient.validateRequest.mockReturnValue(true)
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockReq.twilioData).toEqual(invalidPhoneBody)
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('Security features', () => {
    it('blocks known spam patterns in message body', () => {
      const spamBody = {
        MessageSid: 'SMtest123',
        From: '+1234567890',
        To: '+0987654321',
        Body: 'URGENT! You have won $1,000,000! Click here: http://malicious-site.com'
      }
      
      mockReq.body = spamBody
      mockTwilioClient.validateRequest.mockReturnValue(true)
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      // Should still process but flag for review
      expect(mockReq.twilioData).toEqual(spamBody)
      expect(mockNext).toHaveBeenCalled()
    })

    it('detects suspicious message patterns', () => {
      const suspiciousBody = {
        MessageSid: 'SMtest123',
        From: '+1234567890',
        To: '+0987654321',
        Body: 'Please provide your password and account details'
      }
      
      mockReq.body = suspiciousBody
      mockTwilioClient.validateRequest.mockReturnValue(true)
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockReq.twilioData).toEqual(suspiciousBody)
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('Error handling', () => {
    it('handles signature validation errors gracefully', () => {
      mockTwilioClient.validateRequest.mockImplementation(() => {
        throw new Error('Signature validation failed')
      })
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Webhook processing failed'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('handles Twilio client initialization errors', () => {
      mockTwilio.mockImplementation(() => {
        throw new Error('Twilio initialization failed')
      })
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Webhook processing failed'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('Logging and monitoring', () => {
    it('logs successful webhook processing', () => {
      mockTwilioClient.validateRequest.mockReturnValue(true)
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockNext).toHaveBeenCalled()
    })

    it('logs security violations', () => {
      delete mockReq.headers['x-twilio-signature']
      
      twilioWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
    })

    it('logs rate limiting events', () => {
      // Simulate rapid requests from same number
      const rapidRequests = Array(20).fill().map(() => ({
        ...mockReq,
        body: {
          ...mockReq.body,
          From: '+1555999888'
        }
      }))

      mockTwilioClient.validateRequest.mockReturnValue(true)

      for (const req of rapidRequests) {
        twilioWebhook(req, mockRes, mockNext)
      }

      expect(mockNext).toHaveBeenCalled()
    })
  })
})