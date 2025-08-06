import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContactClientModal = ({ isOpen, onClose, onSendMessage, client }) => {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!message) {
      alert('Message cannot be empty.');
      return;
    }
    onSendMessage({ message });
    console.log(`Sending message to ${client?.name}:`, { message });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md construction-shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Contact {client?.name}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg construction-transition"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <p className="text-sm text-muted-foreground">
            You are sending a message to <span className="font-semibold text-foreground">{client?.name}</span> ({client?.email}).
          </p>
          <textarea
            className="w-full p-2 border rounded-md bg-input border-border"
            rows="5"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            fullWidth
          >
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactClientModal;