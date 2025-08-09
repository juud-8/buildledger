import { multiAI } from '../utils/aiClient';
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
 * Generate a helpful business response using predefined responses
 */
const generateMockResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  const responses = {
    revenue: "Based on your current revenue performance, I recommend focusing on these areas: 1) Review your pricing strategy to ensure profitability, 2) Follow up on pending invoices to improve cash flow, 3) Consider offering maintenance contracts for recurring revenue.",
    
    profit: "To improve profitability: 1) Track material costs closely and negotiate better rates with suppliers, 2) Monitor labor hours per project to identify inefficiencies, 3) Use accurate estimates and include contingency buffers, 4) Review completed projects to identify cost overruns.",
    
    project: "For better project management: 1) Use milestone-based progress tracking, 2) Implement regular client check-ins, 3) Monitor resource allocation across projects, 4) Set clear expectations and deliverables upfront, 5) Use project templates for common work types.",
    
    client: "To improve client relationships: 1) Maintain regular communication throughout projects, 2) Send progress photos and updates, 3) Be transparent about timelines and potential delays, 4) Follow up after project completion, 5) Ask for referrals from satisfied clients.",
    
    cash: "For better cash flow management: 1) Invoice promptly upon milestone completion, 2) Offer incentives for early payment, 3) Set up automatic payment reminders, 4) Consider requiring deposits for larger projects, 5) Monitor accounts receivable regularly.",
    
    insight: "Key business insights for construction companies: 1) Track job costing accuracy vs. actual costs, 2) Monitor seasonal patterns in your business, 3) Analyze which project types are most profitable, 4) Review supplier performance and pricing trends, 5) Track customer satisfaction and repeat business rates.",
    
    track: "To track project progress effectively: 1) Set clear milestones and deadlines, 2) Use photo documentation for visual progress, 3) Track labor hours and material usage, 4) Monitor budget vs. actual costs weekly, 5) Maintain regular communication with your team and clients.",
    
    items: "For better item management: 1) Track material usage patterns to optimize ordering, 2) Negotiate bulk discounts with frequent suppliers, 3) Monitor inventory levels to avoid waste, 4) Update pricing regularly based on supplier changes, 5) Use standardized material lists for similar projects."
  };
  
  // Find matching response
  for (const [key, response] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }
  
  // Default helpful response
  return "I'm here to help you manage your construction business more effectively! I can provide insights on project management, financial tracking, client relationships, and business growth strategies. Feel free to ask me about specific areas like revenue, profitability, project tracking, or cash flow management.";
};

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

    // Try to use real AI first, fall back to mock responses
    try {
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

      // Use multi-provider AI with streaming
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ];

      const fullResponse = await multiAI.generateStreamingResponse(messages, onChunk, {
        max_tokens: 500,
        temperature: 0.7
      });

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
    } catch (aiError) {
      console.log('AI service unavailable, using predefined responses:', aiError.message);
      
      // Use mock response with streaming simulation
      const mockResponse = generateMockResponse(message);
      
      // Simulate streaming by chunking the response
      const words = mockResponse.split(' ');
      let currentText = '';
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i];
        onChunk(' ' + words[i]);
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      return mockResponse;
    }
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
      // Try to use real AI first, fall back to mock responses
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

        // Prepare conversation for AI
        const messages = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: message }
        ];

        // Use multi-provider AI
        const aiResult = await multiAI.generateResponse(messages, {
          max_tokens: 500,
          temperature: 0.7
        });

        const aiResponse = aiResult.content || 'Sorry, I couldn\'t process your request.';
        
        console.log(`AI response generated using provider: ${aiResult.provider}`);

        // Store conversation in database if we have real data
        if (businessData && data !== mockBusinessData) {
          try {
            const { data: { user } } = await supabase?.auth?.getUser();
            if (user) {
              await supabase?.from('ai_conversations')?.insert({
                company_id: businessData.company_id,
                user_id: user.id,
                session_id: 'default',
                message: message,
                response: aiResponse,
                context: { businessData: true }
              });
            }
          } catch (error) {
            console.error('Error storing conversation:', error);
          }
        }

        return {
          response: aiResponse,
          success: true
        };
      } catch (aiError) {
        console.log('AI service unavailable, using predefined responses:', aiError.message);
        
        // Use mock response
        const mockResponse = generateMockResponse(message);
        
        return {
          response: mockResponse,
          success: true,
          provider: 'mock'
        };
      }
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