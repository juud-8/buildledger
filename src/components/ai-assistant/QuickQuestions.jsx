import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const QuickQuestions = ({ questions = [], onQuestionClick }) => {
  if (!questions?.length) return null;

  return (
    <div className="px-4 pb-4">
      <div className="mb-3">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Icon name="Lightbulb" size={12} />
          <span>Try asking:</span>
        </div>
      </div>
      <div className="space-y-2">
        {questions?.slice(0, 4)?.map((question, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuestionClick?.(question)}
              className="w-full justify-start text-left text-xs h-auto py-2 px-3 hover:bg-muted/80 border-dashed"
            >
              <Icon name="MessageSquare" size={12} className="mr-2 flex-shrink-0" />
              <span className="truncate">{question}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuickQuestions;