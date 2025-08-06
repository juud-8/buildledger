import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { projectsService } from '../../../services/projectsService';
import { clientsService } from '../../../services/clientsService';
import { showErrorToast } from '../../../utils/toastHelper';

const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    start_date: '',
    end_date: '',
    budget: '',
    status: 'planning',
    address: '',
    project_type: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState({});

  // Load clients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  const loadClients = async () => {
    try {
      setIsLoadingClients(true);
      const clientsData = await clientsService.getClients();
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      showErrorToast('Failed to load clients');
    } finally {
      setIsLoadingClients(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (!formData.client_id) {
      newErrors.client_id = 'Please select a client';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Please enter a valid budget amount';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Project address is required';
    }

    if (!formData.project_type?.trim()) {
      newErrors.project_type = 'Project type is required';
    }

    // Validate end date is after start date
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Prepare project data
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        client_id: formData.client_id,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        budget: parseFloat(formData.budget),
        status: formData.status,
        address: formData.address.trim(),
        project_type: formData.project_type.trim(),
        priority: formData.priority
      };

      const createdProject = await projectsService.createProject(projectData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        client_id: '',
        start_date: '',
        end_date: '',
        budget: '',
        status: 'planning',
        address: '',
        project_type: '',
        priority: 'medium'
      });
      setErrors({});

      onSuccess?.(createdProject);
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'in progress', label: 'In Progress' },
    { value: 'on hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'delayed', label: 'Delayed' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const projectTypeOptions = [
    'Residential Construction',
    'Commercial Construction', 
    'Renovation',
    'Remodeling',
    'Foundation Work',
    'Roofing',
    'Electrical',
    'Plumbing',
    'HVAC',
    'Landscaping',
    'Other'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-card border border-border rounded-lg construction-shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Create New Project</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new construction project to your portfolio
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={24} />
          </Button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Project Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                    error={errors.name}
                    disabled={isLoading}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the project scope and requirements"
                    rows={3}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground resize-none ${
                      errors.description ? 'border-red-500' : 'border-input'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Client *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => handleInputChange('client_id', e.target.value)}
                    disabled={isLoading || isLoadingClients}
                    className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                      errors.client_id ? 'border-red-500' : 'border-input'
                    }`}
                  >
                    <option value="">
                      {isLoadingClients ? 'Loading clients...' : 'Select a client'}
                    </option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {errors.client_id && (
                    <p className="mt-1 text-sm text-red-500">{errors.client_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Project Type *
                  </label>
                  <select
                    value={formData.project_type}
                    onChange={(e) => handleInputChange('project_type', e.target.value)}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                      errors.project_type ? 'border-red-500' : 'border-input'
                    }`}
                  >
                    <option value="">Select project type</option>
                    {projectTypeOptions.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.project_type && (
                    <p className="mt-1 text-sm text-red-500">{errors.project_type}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Project Address *
                </label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter project location address"
                  error={errors.address}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Project Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    error={errors.start_date}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Target End Date
                  </label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    error={errors.end_date}
                    disabled={isLoading}
                    min={formData.start_date}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Budget *
                  </label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    error={errors.budget}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            iconName={isLoading ? "Loader2" : "Plus"}
            iconClassName={isLoading ? "animate-spin" : ""}
          >
            {isLoading ? 'Creating Project...' : 'Create Project'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;