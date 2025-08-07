import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV_CONFIG, getAIKey } from '../lib/env';

class MultiProviderAI {
  constructor() {
    this.providers = [];
    this.currentProviderIndex = 0;
    this.initializeProviders();
  }

  initializeProviders() {
    // Determine which keys to use based on environment
    const useProductionKeys = ENV_CONFIG.USE_PRODUCTION_AI || ENV_CONFIG.IS_PRODUCTION;
    
    // OpenAI Provider
    const openAIKey = getAIKey('openai');
    if (openAIKey) {
      this.providers.push({
        name: 'openai',
        client: new OpenAI({
          apiKey: openAIKey,
          dangerouslyAllowBrowser: true,
        }),
        model: 'gpt-3.5-turbo',
        type: 'openai',
        environment: useProductionKeys ? 'production' : 'development'
      });
    }

    // Google Gemini Provider
    const geminiKey = getAIKey('gemini');
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      this.providers.push({
        name: 'gemini',
        client: genAI.getGenerativeModel({ model: 'gemini-pro' }),
        model: 'gemini-pro',
        type: 'gemini',
        environment: useProductionKeys ? 'production' : 'development'
      });
    }

    // Anthropic Claude Provider (note: requires server-side proxy for browser usage)
    const anthropicKey = getAIKey('anthropic');
    if (anthropicKey) {
      this.providers.push({
        name: 'anthropic',
        client: null, // Would need server-side proxy
        model: 'claude-3-haiku-20240307',
        type: 'anthropic',
        environment: useProductionKeys ? 'production' : 'development'
      });
    }

    console.log(`Initialized ${this.providers.length} AI providers in ${useProductionKeys ? 'PRODUCTION' : 'DEVELOPMENT'} mode:`, 
      this.providers.map(p => `${p.name} (${p.environment})`));
  }

  async testProvider(provider) {
    try {
      if (provider.type === 'openai') {
        const response = await provider.client.chat.completions.create({
          model: provider.model,
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 5
        });
        return !!response.choices[0]?.message?.content;
      } else if (provider.type === 'gemini') {
        const result = await provider.client.generateContent('Test');
        return !!result.response.text();
      }
      return false;
    } catch (error) {
      console.warn(`Provider ${provider.name} test failed:`, error.message);
      return false;
    }
  }

  async findWorkingProvider() {
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      console.log(`Testing provider: ${provider.name}`);
      
      if (await this.testProvider(provider)) {
        console.log(`✅ Provider ${provider.name} is working`);
        this.currentProviderIndex = i;
        return provider;
      } else {
        console.log(`❌ Provider ${provider.name} failed`);
      }
    }
    return null;
  }

  async generateResponse(messages, options = {}) {
    const maxRetries = this.providers.length;
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const provider = this.providers[this.currentProviderIndex];
      if (!provider) break;

      try {
        console.log(`Attempting with provider: ${provider.name}`);

        if (provider.type === 'openai') {
          const response = await provider.client.chat.completions.create({
            model: provider.model,
            messages: messages,
            max_tokens: options.max_tokens || 500,
            temperature: options.temperature || 0.7,
            stream: options.stream || false
          });

          if (options.stream) {
            return response;
          } else {
            return {
              content: response.choices[0]?.message?.content || '',
              provider: provider.name,
              success: true
            };
          }
        } else if (provider.type === 'gemini') {
          // Convert OpenAI format to Gemini format
          const lastMessage = messages[messages.length - 1];
          const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
          const prompt = systemPrompt ? `${systemPrompt}\n\nUser: ${lastMessage.content}` : lastMessage.content;

          const result = await provider.client.generateContent(prompt);
          const response = result.response;

          return {
            content: response.text() || '',
            provider: provider.name,
            success: true
          };
        }
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error.message);
        lastError = error;
        
        // Try next provider
        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
      }
    }

    // All providers failed
    return {
      content: 'I apologize, but I\'m currently experiencing technical difficulties. Our AI services are temporarily unavailable. Please try again in a few moments.',
      provider: 'fallback',
      success: false,
      error: lastError?.message || 'All AI providers failed'
    };
  }

  async generateStreamingResponse(messages, onChunk, options = {}) {
    const provider = this.providers[this.currentProviderIndex];
    if (!provider || provider.type !== 'openai') {
      // Fallback to non-streaming for non-OpenAI providers
      const response = await this.generateResponse(messages, options);
      if (response.success && onChunk) {
        // Simulate streaming by sending the complete response
        onChunk(response.content);
      }
      return response.content;
    }

    try {
      const response = await provider.client.chat.completions.create({
        model: provider.model,
        messages: messages,
        max_tokens: options.max_tokens || 500,
        temperature: options.temperature || 0.7,
        stream: true
      });

      let fullResponse = '';
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          if (onChunk) onChunk(content);
        }
      }

      return fullResponse;
    } catch (error) {
      console.warn(`Streaming failed with ${provider.name}:`, error.message);
      
      // Try next provider with non-streaming
      this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
      const fallbackResponse = await this.generateResponse(messages, options);
      
      if (fallbackResponse.success && onChunk) {
        onChunk(fallbackResponse.content);
      }
      
      return fallbackResponse.content;
    }
  }

  getAvailableProviders() {
    return this.providers.map(p => ({ name: p.name, model: p.model }));
  }

  getCurrentProvider() {
    return this.providers[this.currentProviderIndex]?.name || 'none';
  }
}

// Export singleton instance
export const multiAI = new MultiProviderAI();
export default multiAI;