import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import ChatMessage from './ChatMessage';
import QuickQuestions from './QuickQuestions';
import VoiceInput from './VoiceInput';
import { getStreamingBusinessDataResponse, commonQuestions } from '../../services/aiAssistantService';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hi! I'm your AI business assistant. I can help you analyze your BuildLedger data. Ask me about your revenue, projects, clients, or any business insights you need!",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef?.current) {
      inputRef?.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message?.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message?.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Create a placeholder message for streaming
      const assistantMessageId = Date.now() + 1;
      const assistantMessage = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessageId(assistantMessageId);

      // Use streaming response
      await getStreamingBusinessDataResponse(message?.trim(), (chunk) => {
        setMessages(prev => prev?.map(msg => 
          msg?.id === assistantMessageId 
            ? { ...msg, content: msg?.content + chunk }
            : msg
        ));
      });

      // Mark streaming as complete
      setMessages(prev => prev?.map(msg => 
        msg?.id === assistantMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));
      setStreamingMessageId(null);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: error?.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleVoiceInput = (transcript) => {
    setInputMessage(transcript);
    handleSendMessage(transcript);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: "Chat cleared! How can I help you with your business data today?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          size="icon"
        >
          <Icon name={isOpen ? "X" : "MessageCircle"} size={24} color="white" />
        </Button>
      </motion.div>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-card border border-border rounded-lg shadow-xl z-40 flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Bot" size={16} color="white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Business Data Helper</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  className="h-8 w-8"
                  title="Clear chat"
                >
                  <Icon name="RotateCcw" size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <Icon name="Minus" size={14} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages?.map((message) => (
                <ChatMessage 
                  key={message?.id} 
                  message={message} 
                  isStreaming={message?.id === streamingMessageId}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages?.length <= 1 && (
              <QuickQuestions 
                questions={commonQuestions}
                onQuestionClick={handleQuickQuestion}
              />
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e?.target?.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your business data..."
                    className="w-full px-3 py-2 pr-10 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-20"
                    rows={1}
                    disabled={isLoading}
                  />
                  <VoiceInput onVoiceInput={handleVoiceInput} disabled={isLoading} />
                </div>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage?.trim() || isLoading}
                  size="icon"
                  className="h-10 w-10"
                >
                  {isLoading ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="Send" size={16} />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Mobile Responsive Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      {/* Mobile Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-x-4 bottom-24 top-20 bg-card border border-border rounded-lg shadow-xl z-40 flex flex-col overflow-hidden lg:hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Bot" size={16} color="white" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">Business Data Helper</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            {/* Mobile Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages?.map((message) => (
                <ChatMessage 
                  key={message?.id} 
                  message={message} 
                  isStreaming={message?.id === streamingMessageId}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Mobile Quick Questions */}
            {messages?.length <= 1 && (
              <QuickQuestions 
                questions={commonQuestions}
                onQuestionClick={handleQuickQuestion}
              />
            )}

            {/* Mobile Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e?.target?.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your business data..."
                    className="w-full px-3 py-2 pr-10 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-20"
                    rows={1}
                    disabled={isLoading}
                  />
                  <VoiceInput onVoiceInput={handleVoiceInput} disabled={isLoading} />
                </div>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage?.trim() || isLoading}
                  size="icon"
                >
                  {isLoading ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="Send" size={16} />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;