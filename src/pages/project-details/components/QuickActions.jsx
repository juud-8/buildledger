import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import AddMilestoneModal from './AddMilestoneModal';
import UploadPhotosModal from './UploadPhotosModal';
import CreateInvoiceModal from './CreateInvoiceModal';
import ContactClientModal from './ContactClientModal';
import ScheduleInspectionModal from './ScheduleInspectionModal';

const QuickActions = ({ project, recentUpdates = [] }) => {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isUploadPhotosModalOpen, setIsUploadPhotosModalOpen] = useState(false);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [isContactClientModalOpen, setIsContactClientModalOpen] = useState(false);
  const [isScheduleInspectionModalOpen, setIsScheduleInspectionModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(project?.status);

  const statusOptions = [
    { value: 'planning', label: 'Planning', color: 'bg-blue-100 text-blue-800' },
    { value: 'in progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'on hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'delayed', label: 'Delayed', color: 'bg-red-100 text-red-800' },
  ];

  const quickActions = [
    {
      id: 'update-status',
      label: 'Update Status',
      icon: 'RefreshCw',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => setIsStatusModalOpen(true)
    },
    {
      id: 'add-milestone',
      label: 'Add Milestone',
      icon: 'Flag',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => setIsMilestoneModalOpen(true)
    },
    {
      id: 'upload-photos',
      label: 'Upload Photos',
      icon: 'Camera',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => setIsUploadPhotosModalOpen(true)
    },
    {
      id: 'create-invoice',
      label: 'Create Invoice',
      icon: 'Receipt',
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => setIsCreateInvoiceModalOpen(true)
    },
    {
      id: 'contact-client',
      label: 'Contact Client',
      icon: 'Phone',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => setIsContactClientModalOpen(true)
    },
    {
      id: 'schedule-inspection',
      label: 'Schedule Inspection',
      icon: 'Search',
      color: 'bg-teal-500 hover:bg-teal-600',
      onClick: () => setIsScheduleInspectionModalOpen(true)
    }
  ];

  

  const handleStatusUpdate = () => {
    // In real app, would make API call to update status
    setIsStatusModalOpen(false);
    console.log('Status updated to:', selectedStatus);
  };

  const handleAddMilestone = (milestone) => {
    // In a real app, you would make an API call to add the milestone
    console.log('New milestone added:', milestone);
  };

  const handleUploadPhotos = (files) => {
    // In a real app, you would make an API call to upload the photos
    console.log('Uploading photos:', files);
  };

  const handleCreateInvoice = (invoice) => {
    // In a real app, you would make an API call to create the invoice
    console.log('Creating invoice:', invoice);
  };

  const handleContactClient = (message) => {
    // In a real app, you would make an API call to send the message
    console.log('Sending message to client:', message);
  };

  const handleScheduleInspection = (inspection) => {
    // In a real app, you would make an API call to schedule the inspection
    console.log('Scheduling inspection:', inspection);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions?.map((action) => (
            <button
              key={action?.id}
              onClick={action?.onClick}
              className={`${action?.color} text-white p-4 rounded-lg construction-transition flex items-center space-x-3 text-left`}
            >
              <Icon name={action?.icon} size={20} />
              <span className="font-medium">{action?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Project Stats */}
      <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Project Stats</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Calendar" size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Days Active</span>
            </div>
            <span className="font-semibold text-foreground">{project?.daysActive}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Team Members</span>
            </div>
            <span className="font-semibold text-foreground">{project?.teamSize}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Completed Tasks</span>
            </div>
            <span className="font-semibold text-foreground">{project?.completedTasks}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Camera" size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Photos Uploaded</span>
            </div>
            <span className="font-semibold text-foreground">{project?.photos?.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="FileText" size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Documents</span>
            </div>
            <span className="font-semibold text-foreground">{project?.documents?.length}</span>
          </div>
        </div>
      </div>
      {/* Recent Updates */}
      <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Updates</h3>
        <div className="space-y-3">
          {recentUpdates?.map((update) => (
            <div key={update?.id} className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg construction-transition">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name={update?.icon} size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{update?.message}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">{update?.user}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{update?.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Contact Information */}
      <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{project?.client?.name}</p>
              <p className="text-sm text-muted-foreground">Client</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" iconName="Phone">
              </Button>
              <Button variant="ghost" size="sm" iconName="Mail">
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Mike Johnson</p>
              <p className="text-sm text-muted-foreground">Project Manager</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" iconName="Phone">
              </Button>
              <Button variant="ghost" size="sm" iconName="MessageCircle">
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Tom Wilson</p>
              <p className="text-sm text-muted-foreground">Site Supervisor</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" iconName="Phone">
              </Button>
              <Button variant="ghost" size="sm" iconName="MessageCircle">
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AddMilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        onAddMilestone={handleAddMilestone}
      />

      <UploadPhotosModal
        isOpen={isUploadPhotosModalOpen}
        onClose={() => setIsUploadPhotosModalOpen(false)}
        onUpload={handleUploadPhotos}
      />

      <CreateInvoiceModal
        isOpen={isCreateInvoiceModalOpen}
        onClose={() => setIsCreateInvoiceModalOpen(false)}
        onCreateInvoice={handleCreateInvoice}
      />

      <ContactClientModal
        isOpen={isContactClientModalOpen}
        onClose={() => setIsContactClientModalOpen(false)}
        onSendMessage={handleContactClient}
        client={project?.client}
      />

      <ScheduleInspectionModal
        isOpen={isScheduleInspectionModalOpen}
        onClose={() => setIsScheduleInspectionModalOpen(false)}
        onScheduleInspection={handleScheduleInspection}
      />

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md construction-shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Update Project Status</h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="p-2 hover:bg-muted rounded-lg construction-transition"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              {statusOptions?.map((option) => (
                <button
                  key={option?.value}
                  onClick={() => setSelectedStatus(option?.value)}
                  className={`w-full p-3 rounded-lg border construction-transition text-left ${
                    selectedStatus === option?.value
                      ? 'border-primary bg-primary/5' :'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{option?.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${option?.color}`}>
                      {option?.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsStatusModalOpen(false)}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleStatusUpdate}
                fullWidth
              >
                Update Status
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;