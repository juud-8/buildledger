// DEPRECATED: Direct OpenAI client replaced with secure server proxy
// Import aiClient from './aiClient.js' instead

import { multiAI } from './aiClient';

/**
 * @deprecated Use aiClient instead for secure server-proxied AI requests
 */
const openai = {
  chat: {
    completions: {
      create: async (options) => {
        console.warn('Direct OpenAI client deprecated - using secure proxy instead');
        const response = await multiAI.generateResponse(options.messages, {
          model: options.model,
          max_tokens: options.max_tokens,
          temperature: options.temperature,
          stream: options.stream
        });
        
        // Convert to OpenAI-compatible format for backward compatibility
        return {
          choices: [{
            message: {
              content: response.content
            }
          }],
          model: response.provider,
          usage: response.usage
        };
      }
    }
  }
};

export default openai;