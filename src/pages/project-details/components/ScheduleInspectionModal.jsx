import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ScheduleInspectionModal = ({ isOpen, onClose, onScheduleInspection }) => {
  const [inspectionType, setInspectionType] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspector, setInspector] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!inspectionType || !inspectionDate) {
      alert('Inspection Type and Date are required.');
      return;
    }
    onScheduleInspection({ inspectionType, inspectionDate, inspector });
    console.log('Scheduling inspection:', { inspectionType, inspectionDate, inspector });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md construction-shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Schedule Inspection</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg construction-transition"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <Input
            label="Inspection Type"
            placeholder="e.g., Electrical, Plumbing"
            value={inspectionType}
            onChange={(e) => setInspectionType(e.target.value)}
          />
          <Input
            label="Inspector"
            placeholder="e.g., City Inspector"
            value={inspector}
            onChange={(e) => setInspector(e.target.value)}
          />
          <Input
            label="Inspection Date"
            type="date"
            value={inspectionDate}
            onChange={(e) => setInspectionDate(e.target.value)}
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
            Schedule
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInspectionModal;
