import { supabase } from '../lib/supabase';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';

class TwilioService {
  constructor() {
    this.accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    this.authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    this.fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
    this.webhookUrl = import.meta.env.VITE_TWILIO_WEBHOOK_URL;
  }

  /**
   * Send SMS message via Twilio API
   * @param {Object} messageData - Message data
   * @param {string} messageData.to - Recipient phone number
   * @param {string} messageData.message - Message content
   * @param {string} messageData.messageId - Database message ID for tracking
   */
  async sendSMS({ to, message, messageId }) {
    try {
      // Call Supabase Edge Function to send SMS via Twilio
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/twilio-sms/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          to: this.formatPhoneNumber(to),
          message: message,
          messageId: messageId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update message status in database
      await this.updateMessageStatus(messageId, {
        status: 'sent',
        twilio_sid: result.sid,
        sent_at: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('Error sending SMS:', error);
      
      // Update message status to failed
      await this.updateMessageStatus(messageId, {
        status: 'failed',
        twilio_error_message: error.message
      });
      
      throw error;
    }
  }

  /**
   * Handle incoming SMS webhook
   * @param {Object} webhookData - Twilio webhook data
   */
  async handleIncomingSMS(webhookData) {
    try {
      const { From, Body, MessageSid, To } = webhookData;
      
      // Find the client by phone number
      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id, company_id, name')
        .eq('phone', this.formatPhoneNumber(From))
        .limit(1);

      if (clientError) throw clientError;

      if (clients && clients.length > 0) {
        const client = clients[0];
        
        // Save incoming message to database
        const messageData = {
          company_id: client.company_id,
          client_id: client.id,
          direction: 'inbound',
          phone_number: From,
          message_content: Body,
          status: 'replied',
          twilio_sid: MessageSid,
          replied_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('client_messages')
          .insert(messageData);

        if (insertError) throw insertError;

        console.log('Incoming SMS saved:', messageData);
      } else {
        console.warn('No client found for phone number:', From);
      }
    } catch (error) {
      console.error('Error handling incoming SMS:', error);
    }
  }

  /**
   * Handle message status updates from Twilio
   * @param {Object} statusData - Twilio status webhook data
   */
  async handleStatusUpdate(statusData) {
    try {
      const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = statusData;
      
      const updateData = {
        status: this.mapTwilioStatus(MessageStatus),
        updated_at: new Date().toISOString()
      };

      if (MessageStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      if (ErrorCode) {
        updateData.twilio_error_code = ErrorCode;
        updateData.twilio_error_message = ErrorMessage;
        updateData.status = 'failed';
      }

      const { error } = await supabase
        .from('client_messages')
        .update(updateData)
        .eq('twilio_sid', MessageSid);

      if (error) throw error;

      console.log('Message status updated:', MessageSid, MessageStatus);
    } catch (error) {
      console.error('Error handling status update:', error);
    }
  }

  /**
   * Update message status in database
   * @private
   */
  async updateMessageStatus(messageId, updateData) {
    try {
      const { error } = await supabase
        .from('client_messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }

  /**
   * Format phone number to E.164 format
   * @private
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Add +1 for US numbers if not present
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    return phoneNumber; // Return as-is if already formatted or international
  }

  /**
   * Map Twilio message status to our internal status
   * @private
   */
  mapTwilioStatus(twilioStatus) {
    const statusMap = {
      'queued': 'pending',
      'sent': 'sent',
      'delivered': 'delivered',
      'undelivered': 'failed',
      'failed': 'failed',
      'received': 'replied'
    };
    
    return statusMap[twilioStatus] || 'pending';
  }

  /**
   * Get auth token for API calls
   * @private
   */
  async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Check if messaging is enabled for a client
   */
  async checkMessagingConsent(clientId) {
    try {
      const { data, error } = await supabase
        .from('client_message_consent')
        .select('has_consented, opted_out')
        .eq('client_id', clientId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? (data.has_consented && !data.opted_out) : false;
    } catch (error) {
      console.error('Error checking messaging consent:', error);
      return false;
    }
  }

  /**
   * Get message analytics for a company
   */
  async getMessageAnalytics(companyId, dateRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const { data, error } = await supabase
        .from('client_messages')
        .select('status, direction, created_at')
        .eq('company_id', companyId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const analytics = {
        total: data.length,
        sent: data.filter(m => m.status === 'sent' || m.status === 'delivered').length,
        delivered: data.filter(m => m.status === 'delivered').length,
        failed: data.filter(m => m.status === 'failed').length,
        replies: data.filter(m => m.direction === 'inbound').length
      };

      analytics.deliveryRate = analytics.sent > 0 ? (analytics.delivered / analytics.sent * 100).toFixed(1) : 0;
      analytics.responseRate = analytics.sent > 0 ? (analytics.replies / analytics.sent * 100).toFixed(1) : 0;

      return analytics;
    } catch (error) {
      console.error('Error getting message analytics:', error);
      return null;
    }
  }
}

// Create singleton instance
const twilioService = new TwilioService();

export default twilioService;