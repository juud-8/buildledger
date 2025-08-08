import { aiProxyClient } from './aiProxyClient';

class MultiProviderAI {
  constructor() {
    this.providers = ['openai', 'gemini', 'anthropic'];
    this.currentProviderIndex = 0;
    this.proxyClient = aiProxyClient;
    console.log('✅ AI Client initialized with secure proxy backend');
  }

  async testProvider(provider) {
    try {
      const response = await this.proxyClient.generateResponse(
        [{ role: 'user', content: 'Test' }], 
        { provider, max_tokens: 5 }
      );
      return !!response.content;
    } catch (error) {
      console.warn(`Provider ${provider} test failed:`, error.message);
      return false;
    }
  }

  async findWorkingProvider() {
    const healthCheck = await this.proxyClient.checkHealth();
    if (healthCheck.status === 'ok') {
      console.log('✅ AI Proxy service is healthy');
      // Find first available provider from health check
      const availableProvider = Object.keys(healthCheck.services).find(
        service => healthCheck.services[service]
      );
      if (availableProvider) {
        this.currentProviderIndex = this.providers.indexOf(availableProvider);
        return availableProvider;
      }
    }
    return null;
  }

  async generateResponse(messages, options = {}) {
    try {
      const response = await this.proxyClient.generateResponse(messages, options);
      return {
        content: response.content || '',
        provider: response.model || 'proxy',
        success: true,
        usage: response.usage
      };
    } catch (error) {
      console.error('AI Proxy request failed:', error);
      return {
        content: 'I apologize, but I\'m currently experiencing technical difficulties. Our AI services are temporarily unavailable. Please try again in a few moments.',
        provider: 'fallback',
        success: false,
        error: error.message || 'AI service unavailable'
      };
    }
  }

  async generateStreamingResponse(messages, onChunk, options = {}) {
    try {
      return await this.proxyClient.generateStreamingResponse(messages, options, onChunk);
    } catch (error) {
      console.warn('Streaming failed, falling back to regular response:', error.message);
      
      // Fallback to non-streaming
      const response = await this.generateResponse(messages, options);
      if (response.success && onChunk) {
        onChunk(response.content);
      }
      
      return response.content;
    }
  }

  getAvailableProviders() {
    return this.providers.map(name => ({ name, model: 'proxy-managed' }));
  }

  getCurrentProvider() {
    return this.providers[this.currentProviderIndex] || 'proxy-auto';
  }
}

// Export singleton instance
export const multiAI = new MultiProviderAI();
export default multiAI;