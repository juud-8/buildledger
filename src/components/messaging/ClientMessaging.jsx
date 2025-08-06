import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import twilioService from '../../services/twilioService';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toastHelper';

const ClientMessaging = ({ client, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [messageTemplates, setMessageTemplates] = useState([]);
  const [consent, setConsent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    if (client?.id) {
      loadMessageHistory();
      loadMessageTemplates();
      checkClientConsent();
    }
  }, [client?.id]);

  const loadMessageHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('client_messages')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading message history:', error);
      showErrorToast('Failed to load message history');
    }
  };

  const loadMessageTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.company_id) return;

      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .or(`company_id.eq.${userProfile.company_id},company_id.is.null`)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setMessageTemplates(data || []);
    } catch (error) {
      console.error('Error loading message templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkClientConsent = async () => {
    if (!client?.phone) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.company_id) return;

      const { data, error } = await supabase
        .from('client_message_consent')
        .select('*')
        .eq('client_id', client.id)
        .eq('phone_number', client.phone)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConsent(data);
        setHasConsent(data.has_consented && !data.opted_out);
      }
    } catch (error) {
      console.error('Error checking client consent:', error);
    }
  };

  const handleConsentToggle = async (hasConsentValue) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.company_id) throw new Error('Company not found');

      const consentData = {
        company_id: userProfile.company_id,
        client_id: client.id,
        phone_number: client.phone,
        has_consented: hasConsentValue,
        consent_date: hasConsentValue ? new Date().toISOString() : null,
        opted_out: !hasConsentValue,
        opted_out_date: !hasConsentValue ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('client_message_consent')
        .upsert(consentData, { 
          onConflict: 'client_id,phone_number',
          returning: 'representation'
        })
        .select()
        .single();

      if (error) throw error;

      setConsent(data);
      setHasConsent(hasConsentValue);
      setShowConsentModal(false);
      
      if (hasConsentValue) {
        showSuccessToast('Client consent granted for SMS messaging');
      } else {
        showInfoToast('Client has opted out of SMS messaging');
      }
    } catch (error) {
      console.error('Error updating consent:', error);
      showErrorToast('Failed to update consent status');
    }
  };

  const interpolateTemplate = (template, variables = {}) => {
    let content = template;
    
    // Default variables
    const defaultVars = {
      client_name: client?.name || 'Client',
      company_name: 'BuildLedger' // This should come from company settings
    };
    
    const allVars = { ...defaultVars, ...variables };
    
    Object.entries(allVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    });
    
    return content;
  };

  const handleTemplateSelect = (templateId) => {
    const template = messageTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCustomMessage(interpolateTemplate(template.content));
    }
  };

  const handleSendMessage = async () => {
    if (!customMessage.trim() || !client?.phone) {
      showErrorToast('Message content and phone number are required');
      return;
    }

    if (!hasConsent) {
      setShowConsentModal(true);
      return;
    }

    try {
      setIsSending(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.company_id) throw new Error('Company not found');

      // Save message to database first
      const messageData = {
        company_id: userProfile.company_id,
        client_id: client.id,
        user_id: user.id,
        template_id: selectedTemplate || null,
        direction: 'outbound',
        phone_number: client.phone,
        message_content: customMessage.trim(),
        status: 'pending'
      };

      const { data: savedMessage, error: saveError } = await supabase
        .from('client_messages')
        .insert(messageData)
        .select()
        .single();

      if (saveError) throw saveError;

      // Send SMS via Twilio service
      try {
        await twilioService.sendSMS({
          to: client.phone,
          message: customMessage.trim(),
          messageId: savedMessage.id
        });

        showSuccessToast('Message sent successfully');
        setCustomMessage('');
        setSelectedTemplate('');
        loadMessageHistory();
        
      } catch (twilioError) {
        console.error('Twilio service error:', twilioError);
        throw twilioError;
      }

    } catch (error) {
      console.error('Error sending message:', error);
      showErrorToast('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return { icon: 'Check', color: 'text-success' };
      case 'delivered': return { icon: 'CheckCheck', color: 'text-success' };
      case 'failed': return { icon: 'AlertTriangle', color: 'text-error' };
      case 'replied': return { icon: 'MessageCircle', color: 'text-primary' };
      default: return { icon: 'Clock', color: 'text-warning' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="Loader2" size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Consent Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Icon name="Shield" size={20} />
              <span>SMS Consent Status</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                hasConsent 
                  ? 'bg-success/10 text-success' 
                  : 'bg-warning/10 text-warning'
              }`}>
                {hasConsent ? 'Consented' : 'No Consent'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!client?.phone ? (
            <div className="text-sm text-muted-foreground">
              No phone number on file. Please add a phone number to enable SMS messaging.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Phone:</strong> {client.phone}
              </div>
              {consent && (
                <div className="text-xs text-muted-foreground">
                  {hasConsent 
                    ? `Consent granted on ${formatDate(consent.consent_date)}`
                    : consent.opted_out 
                      ? `Opted out on ${formatDate(consent.opted_out_date)}`
                      : 'Consent status unknown'
                  }
                </div>
              )}
              {!hasConsent && client?.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConsentModal(true)}
                >
                  Enable SMS Messaging
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Composer */}
      {client?.phone && hasConsent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="MessageSquare" size={20} />
              <span>Send Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Message Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a template...</option>
                {messageTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Message Content
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {customMessage.length}/160 characters
              </div>
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={handleSendMessage}
                disabled={isSending || !customMessage.trim()}
                iconName={isSending ? "Loader2" : "Send"}
                iconPosition="left"
                className={isSending ? "animate-spin" : ""}
              >
                {isSending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon name="History" size={20} />
            <span>Message History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-50" />
              <p>No messages sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const statusInfo = getStatusIcon(message.status);
                return (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.direction === 'outbound'
                        ? 'bg-primary/5 border-l-4 border-l-primary'
                        : 'bg-muted/50 border-l-4 border-l-secondary'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon 
                          name={message.direction === 'outbound' ? 'ArrowRight' : 'ArrowLeft'} 
                          size={16} 
                          className="text-muted-foreground" 
                        />
                        <span className="text-sm font-medium">
                          {message.direction === 'outbound' ? 'Sent' : 'Received'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon 
                          name={statusInfo.icon} 
                          size={14} 
                          className={statusInfo.color} 
                        />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm">{message.message_content}</p>
                    {message.twilio_error_message && (
                      <div className="mt-2 text-xs text-error">
                        Error: {message.twilio_error_message}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-card border border-border rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Icon name="Shield" size={24} className="text-primary" />
                <h3 className="text-lg font-semibold">SMS Consent Required</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Before sending SMS messages to {client?.name}, we need their consent to comply 
                with messaging regulations. Please confirm that the client has agreed to receive 
                SMS messages from your company.
              </p>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                  <div className="text-xs text-warning">
                    <strong>Important:</strong> Only enable SMS messaging if the client has 
                    explicitly consented to receive text messages. Sending unsolicited messages 
                    may violate regulations.
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConsentModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleConsentToggle(true)}
                  className="flex-1"
                >
                  Grant Consent
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMessaging;