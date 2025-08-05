import React, { useState, useEffect, useRef } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const VoiceInput = ({ onVoiceInput, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.transcript;
        if (transcript && onVoiceInput) {
          onVoiceInput(transcript);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef?.current) {
        recognitionRef?.current?.abort();
      }
    };
  }, [onVoiceInput]);

  const startListening = () => {
    if (recognitionRef?.current && !isListening && !disabled) {
      try {
        recognitionRef?.current?.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef?.current && isListening) {
      recognitionRef?.current?.stop();
    }
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={disabled}
      className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 ${
        isListening ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
      }`}
      title={isListening ? 'Stop listening' : 'Voice input'}
    >
      <Icon 
        name={isListening ? "MicOff" : "Mic"} 
        size={14} 
        className={isListening ? 'animate-pulse' : ''}
      />
    </Button>
  );
};

export default VoiceInput;