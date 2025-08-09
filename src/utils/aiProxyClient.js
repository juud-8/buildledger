import { supabase } from '../lib/supabase';
import { ENV_CONFIG } from '../lib/env';

class AIProxyClient {
  constructor() {
    this.baseURL = ENV_CONFIG.API_BASE_URL || 'http://localhost:3001';
    this.isEnabled = ENV_CONFIG.ENVIRONMENT === 'development' || ENV_CONFIG.USE_PRODUCTION_AI === true;
    this.endpoints = {
      chat: '/api/ai/chat',
      openai: '/api/ai/openai/chat',
      gemini: '/api/ai/gemini/chat',
      anthropic: '/api/ai/anthropic/chat',
      stream: '/api/ai/openai/stream',
      health: '/api/ai/health'
    };
  }

  async getAuthHeaders() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.access_token) {
      throw new Error('Not authenticated. Please log in to use AI features.');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  }

  async makeRequest(endpoint, body) {
    if (!this.isEnabled) {
      throw new Error('AI features are currently disabled. Please contact support for assistance.');
    }

    try {
      const headers = await this.getAuthHeaders();
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('AI request timed out');
        throw new Error('AI service request timed out. Please try again.');
      }
      
      console.error(`AI Proxy request failed for ${endpoint}:`, error);
      
      // Handle CORS errors gracefully
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      }
      
      throw error;
    }
  }

  async generateResponse(messages, options = {}) {
    const {
      provider = null, // Let server auto-select
      model,
      max_tokens = 500,
      temperature = 0.7,
      stream = false
    } = options;

    const body = {
      messages,
      provider,
      model,
      max_tokens,
      temperature,
      stream
    };

    // Use provider-specific endpoint if specified, otherwise use generic
    const endpoint = provider ? this.endpoints[provider] : this.endpoints.chat;
    
    if (stream) {
      return this.generateStreamingResponse(messages, options);
    }

    return this.makeRequest(endpoint, body);
  }

  async generateStreamingResponse(messages, options = {}, onChunk = null) {
    if (!this.isEnabled) {
      throw new Error('AI features are currently disabled. Please contact support for assistance.');
    }

    try {
      const headers = await this.getAuthHeaders();
      const body = {
        messages,
        model: options.model,
        max_tokens: options.max_tokens || 500,
        temperature: options.temperature || 0.7,
        stream: true
      };

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for streaming

      const response = await fetch(`${this.baseURL}${this.endpoints.stream}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return fullResponse;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullResponse += parsed.content;
                if (onChunk) onChunk(parsed.content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return fullResponse;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('AI streaming request timed out');
        throw new Error('AI streaming service request timed out. Please try again.');
      }
      
      console.error('Streaming request failed:', error);
      
      // Handle CORS errors gracefully
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        throw new Error('AI streaming service temporarily unavailable. Please try again later.');
      }
      
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}${this.endpoints.health}`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // Convenience methods for specific providers
  async openai(messages, options = {}) {
    return this.generateResponse(messages, { ...options, provider: 'openai' });
  }

  async gemini(messages, options = {}) {
    return this.generateResponse(messages, { ...options, provider: 'gemini' });
  }

  async anthropic(messages, options = {}) {
    return this.generateResponse(messages, { ...options, provider: 'anthropic' });
  }

  // Legacy compatibility methods
  async generateChatResponse(messages, options = {}) {
    const result = await this.generateResponse(messages, options);
    return {
      content: result.content || '',
      provider: result.model || 'unknown',
      success: true
    };
  }

  async generateStreamingChatResponse(messages, onChunk, options = {}) {
    return this.generateStreamingResponse(messages, options, onChunk);
  }
}

// Export singleton instance
export const aiProxyClient = new AIProxyClient();
export default aiProxyClient;