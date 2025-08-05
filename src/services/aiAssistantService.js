import openai from '../utils/openaiClient';
import { supabase } from '../lib/supabase';

/**
 * Fetches real business data from Supabase
 */
const fetchBusinessData = async () => {
  try {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) return null;

    // Get user profile to get company_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();
    
    if (profileError || !userProfile?.company_id) {
      console.error('User profile or company not found');
      return null;
    }

    const companyId = userProfile.company_id;

    // Fetch analytics data
    const { data: analyticsData } = await supabase?.from('analytics_data')?.select('*')?.eq('company_id', companyId)?.order('created_at', { ascending: false });

    // Fetch projects
    const { data: projects } = await supabase?.from('projects')?.select(`
        *,
        client:clients(name)
      `)?.eq('company_id', companyId)?.order('created_at', { ascending: false });

    // Fetch clients
    const { data: clients } = await supabase?.from('clients')?.select('*')?.eq('company_id', companyId)?.eq('is_active', true)?.order('name');

    // Fetch recent invoices
    const { data: invoices } = await supabase?.from('invoices')?.select(`
        *,
        client:clients(name)
      `)?.eq('company_id', companyId)?.order('created_at', { ascending: false })?.limit(10);

    // Fetch items usage
    const { data: items } = await supabase?.from('items_database')?.select('*')?.eq('company_id', companyId)?.eq('is_active', true)?.order('created_at', { ascending: false });

    return {
      analytics: analyticsData || [],
      projects: projects || [],
      clients: clients || [],
      invoices: invoices || [],
      items: items || []
    };
  } catch (error) {
    console.error('Error fetching business data:', error);
    return null;
  }
};

/**
 * Mock business data for demonstration purposes (fallback)
 */
const mockBusinessData = {
  revenue: {
    total: 125000,
    monthly: 15000,
    pending: 8500
  },
  projects: {
    active: 8,
    completed: 12,
    total: 20
  },
  clients: {
    total: 15,
    active: 12
  },
  items: {
    total: 150,
    categories: ['materials', 'labor', 'equipment']
  }
};

/**
 * Common questions for quick access
 */
export const commonQuestions = [
  'How can I improve my project profitability?',
  'What are my best performing items?',
  'How do I track project progress?',
  'What\'s my current cash flow situation?',
  'How can I better manage my clients?',
  'What insights can you provide about my business?'
];

/**
 * Streaming response function for real-time AI responses
 */
export const getStreamingBusinessDataResponse = async (message, onChunk) => {
  try {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile to get company_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();
    
    if (profileError || !userProfile?.company_id) {
      throw new Error('User profile or company not found');
    }

    const companyId = userProfile.company_id;

    // Fetch business data for context
    const businessData = await fetchBusinessData();
    const data = businessData || mockBusinessData;

    // Create system prompt
    const systemPrompt = `You are an AI assistant for a construction business management system called BuildLedger. 

Current Business Context:
- Revenue: $${data.revenue?.total?.toLocaleString() || '0'} total, $${data.revenue?.monthly?.toLocaleString() || '0'} monthly
- Projects: ${data.projects?.active || 0} active, ${data.projects?.completed || 0} completed
- Clients: ${data.clients?.total || 0} total clients
- Items: ${data.items?.total || 0} items in database

You can help with:
- Project management and tracking
- Financial analysis and reporting
- Client relationship management
- Inventory and item management
- Invoice and quote generation
- Business insights and recommendations

Be helpful, professional, and construction-industry focused. Provide specific, actionable advice when possible.`;

    // Call OpenAI API with streaming
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
      stream: true
    });

    let fullResponse = '';
    
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        onChunk(content);
      }
    }

    // Store conversation in database
    try {
      await supabase?.from('ai_conversations')?.insert({
        company_id: companyId,
        user_id: user.id,
        session_id: 'default',
        message: message,
        response: fullResponse,
        context: { businessData: true }
      });
    } catch (error) {
      console.error('Error storing conversation:', error);
    }

    return fullResponse;
  } catch (error) {
    console.error('Error in streaming AI assistant:', error);
    throw error;
  }
};

/**
 * AI Assistant Service for construction business queries
 */
export const aiAssistantService = {
  /**
   * Sends a message to the AI assistant
   */
  async sendMessage(message, conversationHistory = []) {
    try {
      // Fetch real business data
      const businessData = await fetchBusinessData();
      
      // Use mock data as fallback
      const data = businessData || mockBusinessData;
      
      // Create system prompt with business context
      const systemPrompt = `You are an AI assistant for a construction business management system called BuildLedger. 

Current Business Context:
- Revenue: $${data.revenue?.total?.toLocaleString() || '0'} total, $${data.revenue?.monthly?.toLocaleString() || '0'} monthly
- Projects: ${data.projects?.active || 0} active, ${data.projects?.completed || 0} completed
- Clients: ${data.clients?.total || 0} total clients
- Items: ${data.items?.total || 0} items in database

You can help with:
- Project management and tracking
- Financial analysis and reporting
- Client relationship management
- Inventory and item management
- Invoice and quote generation
- Business insights and recommendations

Be helpful, professional, and construction-industry focused. Provide specific, actionable advice when possible.`;

      // Prepare conversation for OpenAI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7
      });

      const aiResponse = response.choices[0]?.message?.content || 'Sorry, I couldn\'t process your request.';

      // Store conversation in database if we have real data
      if (businessData && data !== mockBusinessData) {
        try {
          await supabase?.from('ai_conversations')?.insert({
            company_id: businessData.company_id,
            user_id: user.id,
            session_id: 'default',
            message: message,
            response: aiResponse,
            context: { businessData: true }
          });
        } catch (error) {
          console.error('Error storing conversation:', error);
        }
      }

      return {
        response: aiResponse,
        success: true
      };
    } catch (error) {
      console.error('Error in AI assistant:', error);
      return {
        response: 'Sorry, I\'m having trouble processing your request right now. Please try again later.',
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Gets quick question suggestions based on business context
   */
  async getQuickQuestions() {
    try {
      const businessData = await fetchBusinessData();
      const data = businessData || mockBusinessData;

      const baseQuestions = [
        'How can I improve my project profitability?',
        'What are my best performing items?',
        'How do I track project progress?',
        'What\'s my current cash flow situation?'
      ];

      // Add context-specific questions
      if (data.revenue?.pending > 0) {
        baseQuestions.push(`I have $${data.revenue.pending.toLocaleString()} in pending invoices. How can I improve collections?`);
      }

      if (data.projects?.active > 0) {
        baseQuestions.push(`I have ${data.projects.active} active projects. How can I better manage them?`);
      }

      return baseQuestions.slice(0, 6); // Return max 6 questions
    } catch (error) {
      console.error('Error getting quick questions:', error);
      return [
        'How can I improve my project profitability?',
        'What are my best performing items?',
        'How do I track project progress?',
        'What\'s my current cash flow situation?'
      ];
    }
  },

  /**
   * Gets conversation history for the current user
   */
  async getConversationHistory() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return [];

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        return [];
      }

      const companyId = userProfile.company_id;

      const { data: conversations } = await supabase
        ?.from('ai_conversations')
        ?.select('*')
        ?.eq('company_id', companyId)
        ?.eq('user_id', user.id)
        ?.order('created_at', { ascending: false })
        ?.limit(20);

      return conversations || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }
};