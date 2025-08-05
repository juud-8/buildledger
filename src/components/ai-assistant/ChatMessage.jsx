import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../AppIcon';
import { format } from 'date-fns';

const ChatMessage = ({ message, isStreaming = false }) => {
  const isUser = message?.type === 'user';
  const isAssistant = message?.type === 'assistant';

  const formatMessageContent = (content) => {
    // Convert currency amounts to bold
    const currencyRegex = /\$[\d,]+/g;
    const percentageRegex = /\d+\.?\d*%/g;
    
    let formattedContent = content;
    
    // Make currency amounts bold
    formattedContent = formattedContent?.replace(currencyRegex, (match) => `**${match}**`);
    
    // Make percentages bold
    formattedContent = formattedContent?.replace(percentageRegex, (match) => `**${match}**`);
    
    // Convert markdown bold to HTML
    formattedContent = formattedContent?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return formattedContent;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} space-x-2`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Icon name="Bot" size={14} color="white" />
        </div>
      )}
      {/* Message Content */}
      <div
        className={`max-w-[80%] px-3 py-2 rounded-lg ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : message?.isError
            ? 'bg-destructive/10 text-destructive border border-destructive/20' :'bg-muted text-muted-foreground'
        }`}
      >
        <div 
          className="text-sm whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ 
            __html: formatMessageContent(message?.content || '') 
          }}
        />
        
        {/* Timestamp */}
        <div 
          className={`text-xs mt-1 opacity-70 ${
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
          }`}
        >
          {format(message?.timestamp, 'h:mm a')}
          {isStreaming && (
            <span className="ml-2 inline-flex items-center">
              <Icon name="Loader2" size={10} className="animate-spin" />
            </span>
          )}
        </div>
      </div>
      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Icon name="User" size={14} color="white" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;