const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');

class AIProxyService {
  constructor() {
    this.initializeClients();
    this.setupRateLimiting();
  }

  initializeClients() {
    // Initialize AI clients with server-side keys only
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }

    console.log('✅ AI Proxy initialized with clients:', {
      openai: !!this.openai,
      gemini: !!this.gemini,
      anthropic: !!this.anthropic
    });
  }

  setupRateLimiting() {
    // Rate limiting per user/IP
    this.rateLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 30, // Limit each IP to 30 requests per windowMs
      message: {
        error: 'Too many AI requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Stricter rate limiting for streaming requests
    this.streamRateLimiter = rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 5, // Limit streaming requests
      message: {
        error: 'Too many streaming requests, please try again later.',
        retryAfter: '5 minutes'
      }
    });
  }

  // Validation middleware
  getValidationRules() {
    return [
      body('messages').isArray().withMessage('Messages must be an array'),
      body('messages').isLength({ min: 1, max: 20 }).withMessage('Messages array must contain 1-20 items'),
      body('messages.*').isObject().withMessage('Each message must be an object'),
      body('messages.*.role').isIn(['system', 'user', 'assistant']).withMessage('Invalid message role'),
      body('messages.*.content').isString().isLength({ min: 1, max: 4000 }).withMessage('Message content must be 1-4000 characters'),
      body('provider').optional().isIn(['openai', 'gemini', 'anthropic']).withMessage('Invalid AI provider'),
      body('model').optional().isString().isLength({ max: 100 }).withMessage('Model name too long'),
      body('max_tokens').optional().isInt({ min: 1, max: 2000 }).withMessage('Max tokens must be 1-2000'),
      body('temperature').optional().isFloat({ min: 0, max: 2 }).withMessage('Temperature must be 0-2'),
      body('stream').optional().isBoolean().withMessage('Stream must be boolean')
    ];
  }

  // Authenticate user via Supabase token
  async authenticateUser(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await req.supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  }

  // OpenAI proxy
  async handleOpenAI(req, res) {
    try {
      const { messages, model = 'gpt-3.5-turbo', max_tokens = 500, temperature = 0.7, stream = false } = req.body;

      if (!this.openai) {
        return res.status(503).json({ error: 'OpenAI service not configured' });
      }

      const response = await this.openai.chat.completions.create({
        model,
        messages,
        max_tokens,
        temperature,
        stream,
        user: req.user.id // For OpenAI usage tracking
      });

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        res.json({
          content: response.choices[0]?.message?.content || '',
          model: response.model,
          usage: response.usage
        });
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      res.status(500).json({ error: 'OpenAI request failed', details: error.message });
    }
  }

  // Gemini proxy
  async handleGemini(req, res) {
    try {
      const { messages, model = 'gemini-pro', max_tokens = 500, temperature = 0.7 } = req.body;

      if (!this.gemini) {
        return res.status(503).json({ error: 'Gemini service not configured' });
      }

      const geminiModel = this.gemini.getGenerativeModel({ 
        model,
        generationConfig: {
          maxOutputTokens: max_tokens,
          temperature
        }
      });

      // Convert OpenAI format to Gemini format
      const lastMessage = messages[messages.length - 1];
      const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
      const prompt = systemPrompt ? `${systemPrompt}\n\nUser: ${lastMessage.content}` : lastMessage.content;

      const result = await geminiModel.generateContent(prompt);
      const response = result.response;

      res.json({
        content: response.text() || '',
        model,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } // Gemini doesn't provide usage
      });
    } catch (error) {
      console.error('Gemini API error:', error);
      res.status(500).json({ error: 'Gemini request failed', details: error.message });
    }
  }

  // Anthropic proxy
  async handleAnthropic(req, res) {
    try {
      const { messages, model = 'claude-3-haiku-20240307', max_tokens = 500, temperature = 0.7 } = req.body;

      if (!this.anthropic) {
        return res.status(503).json({ error: 'Anthropic service not configured' });
      }

      // Convert messages format for Anthropic
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const response = await this.anthropic.messages.create({
        model,
        max_tokens,
        temperature,
        system: systemMessage?.content,
        messages: conversationMessages
      });

      res.json({
        content: response.content[0]?.text || '',
        model: response.model,
        usage: response.usage
      });
    } catch (error) {
      console.error('Anthropic API error:', error);
      res.status(500).json({ error: 'Anthropic request failed', details: error.message });
    }
  }

  // Generic AI proxy that routes to available providers
  async handleGenericAI(req, res) {
    const { provider } = req.body;
    
    switch (provider) {
      case 'openai':
        return this.handleOpenAI(req, res);
      case 'gemini':
        return this.handleGemini(req, res);
      case 'anthropic':
        return this.handleAnthropic(req, res);
      default:
        // Auto-select available provider
        if (this.openai) return this.handleOpenAI(req, res);
        if (this.gemini) return this.handleGemini(req, res);
        if (this.anthropic) return this.handleAnthropic(req, res);
        return res.status(503).json({ error: 'No AI services configured' });
    }
  }

  // Create router with all endpoints
  createRouter(express) {
    const router = express.Router();

    // Apply rate limiting to all AI endpoints
    router.use(this.rateLimiter);

    // Validation error handler
    const handleValidationErrors = (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }
      next();
    };

    // Generic AI endpoint with automatic provider selection
    router.post('/chat',
      this.getValidationRules(),
      handleValidationErrors,
      this.authenticateUser.bind(this),
      this.handleGenericAI.bind(this)
    );

    // Provider-specific endpoints
    router.post('/openai/chat',
      this.getValidationRules(),
      handleValidationErrors,
      this.authenticateUser.bind(this),
      this.handleOpenAI.bind(this)
    );

    router.post('/gemini/chat',
      this.getValidationRules(),
      handleValidationErrors,
      this.authenticateUser.bind(this),
      this.handleGemini.bind(this)
    );

    router.post('/anthropic/chat',
      this.getValidationRules(),
      handleValidationErrors,
      this.authenticateUser.bind(this),
      this.handleAnthropic.bind(this)
    );

    // Streaming endpoint (OpenAI only for now)
    router.post('/openai/stream',
      this.streamRateLimiter,
      this.getValidationRules(),
      handleValidationErrors,
      this.authenticateUser.bind(this),
      (req, res) => {
        req.body.stream = true;
        this.handleOpenAI(req, res);
      }
    );

    // Health check endpoint
    router.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        services: {
          openai: !!this.openai,
          gemini: !!this.gemini,
          anthropic: !!this.anthropic
        }
      });
    });

    return router;
  }
}

module.exports = AIProxyService;