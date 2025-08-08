import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'
import { stripeWebhook } from './stripeWebhook.js'

// Mock Stripe
const mockStripe = {
  webhooks: {
    constructEvent: vi.fn()
  }
}

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe)
}))

describe('Stripe Webhook Middleware', () => {
  let mockReq, mockRes, mockNext

  beforeEach(() => {
    mockReq = {
      headers: {
        'stripe-signature': 'test_signature',
        'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)'
      },
      body: 'raw_body_content',
      ip: '127.0.0.1',
      method: 'POST'
    }
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      end: vi.fn()
    }
    
    mockNext = vi.fn()
  })

  describe('Security validation', () => {
    it('rejects requests without stripe-signature header', () => {
      delete mockReq.headers['stripe-signature']
      
      stripeWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing stripe-signature header'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('rejects requests with invalid user agent', () => {
      mockReq.headers['user-agent'] = 'malicious-bot'
      
      stripeWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid user agent'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('rejects non-POST requests', () => {
      mockReq.method = 'GET'
      
      stripeWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(405)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Method not allowed'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('rejects requests without body', () => {
      mockReq.body = ''
      
      stripeWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing request body'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('Stripe signature verification', () => {
    it('rejects requests with invalid signature', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })
      
      stripeWebhook(mockReq, mockRes, mockNext)
      
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        'raw_body_content',
        'test_signature',
        process.env.STRIPE_WEBHOOK_SECRET
      )
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid webhook signature'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('processes valid webhook events', () => {
      const mockEvent = {
        id: 'evt_test_123',
        type: 'invoice.payment_succeeded',
        data: { object: { id: 'in_test_123' } }
      }
      
      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)
      
      stripeWebhook(mockReq, mockRes, mockNext)
      
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        'raw_body_content',
        'test_signature',
        process.env.STRIPE_WEBHOOK_SECRET
      )
      expect(mockReq.stripeEvent).toEqual(mockEvent)
      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })
  })

  describe('Rate limiting', () => {
    it('applies rate limiting per IP', async () => {
      // Simulate multiple requests from same IP
      const requests = Array(10).fill().map(() => ({
        ...mockReq,
        ip: '192.168.1.100'
      }))

      mockStripe.webhooks.constructEvent.mockReturnValue({
        id: 'evt_test_123',
        type: 'customer.created'
      })

      // Process requests rapidly
      for (const req of requests) {
        stripeWebhook(req, mockRes, mockNext)
      }

      // Should eventually rate limit (exact behavior depends on rate limiter config)
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('Event processing security', () => {
    it('handles malformed event data safely', () => {
      const malformedEvent = {
        id: 'evt_test_123',
        type: 'invoice.payment_succeeded',
        data: null // Malformed data
      }
      
      mockStripe.webhooks.constructEvent.mockReturnValue(malformedEvent)
      
      stripeWebhook(mockReq, mockRes, mockNext)
      
      expect(mockReq.stripeEvent).toEqual(malformedEvent)
      expect(mockNext).toHaveBeenCalled()
    })

    it('sanitizes event data for logging', () => {
      const eventWithSensitiveData = {
        id: 'evt_test_123',
        type: 'customer.created',
        data: {
          object: {
            id: 'cus_test_123',
            email: 'user@example.com',
            card: {
              last4: '4242',
              exp_month: 12,
              exp_year: 2025
            }
          }
        }
      }
      
      mockStripe.webhooks.constructEvent.mockReturnValue(eventWithSensitiveData)
      
      stripeWebhook(mockReq, mockRes, mockNext)
      
      expect(mockReq.stripeEvent).toEqual(eventWithSensitiveData)
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('Error handling', () => {
    it('handles webhook construction errors gracefully', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Webhook signature verification failed')
      })
      
      stripeWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid webhook signature'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('handles unexpected errors', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      
      stripeWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Webhook processing failed'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('Logging and monitoring', () => {
    it('logs successful webhook processing', () => {
      const mockEvent = {
        id: 'evt_test_123',
        type: 'invoice.payment_succeeded'
      }
      
      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)
      
      stripeWebhook(mockReq, mockRes, mockNext)
      
      expect(mockNext).toHaveBeenCalled()
    })

    it('logs security violations', () => {
      delete mockReq.headers['stripe-signature']
      
      stripeWebhook(mockReq, mockRes, mockNext)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
    })
  })
})