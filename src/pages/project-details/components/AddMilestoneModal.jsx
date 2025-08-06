import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const AddMilestoneModal = ({ isOpen, onClose, onAddMilestone }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Basic validation
    if (!title || !dueDate) {
      alert('Title and Due Date are required.');
      return;
    }
    onAddMilestone({ title, description, dueDate });
    console.log('Adding milestone:', { title, description, dueDate });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md construction-shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Add New Milestone</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg construction-transition"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <Input
            label="Milestone Title"
            placeholder="e.g., Foundation Pour"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Briefly describe the milestone"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
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
            Add Milestone
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddMilestoneModal;
