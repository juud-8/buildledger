import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import { clientsService } from '../../../services/clientsService';

const CreateClientModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    company_name: '',
    contact_person: '',
    
    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA'
    },
    
    // Additional Information
    client_type: 'residential',
    payment_terms: 'net30',
    preferred_contact_method: 'email',
    notes: '',
    is_active: true
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'User' },
    { id: 'address', label: 'Address', icon: 'MapPin' },
    { id: 'additional', label: 'Additional', icon: 'FileText' }
  ];

  const clientTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'government', label: 'Government' }
  ];

  const paymentTerms = [
    { value: 'cod', label: 'Cash on Delivery' },
    { value: 'net15', label: 'Net 15 Days' },
    { value: 'net30', label: 'Net 30 Days' },
    { value: 'net45', label: 'Net 45 Days' },
    { value: 'net60', label: 'Net 60 Days' }
  ];

  const contactMethods = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'text', label: 'Text Message' },
    { value: 'any', label: 'Any Method' }
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^[\d\s\-\(\)\+]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Address validation (optional but if started, should be complete)
    const { street, city, state, zip } = formData.address;
    if ((street || city || state || zip) && (!street || !city || !state || !zip)) {
      newErrors.address = 'Please complete all address fields or leave them empty';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Switch to the tab with the first error
      if (errors.name || errors.email || errors.phone) {
        setActiveTab('basic');
      } else if (errors.address) {
        setActiveTab('address');
      }
      return;
    }
    
    setIsLoading(true);
    try {
      await clientsService.createClient(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        contact_person: '',
        address: {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'USA'
        },
        client_type: 'residential',
        payment_terms: 'net30',
        preferred_contact_method: 'email',
        notes: '',
        is_active: true
      });
      setErrors({});
      setActiveTab('basic');
    } catch (error) {
      console.error('Error creating client:', error);
      setErrors({ submit: 'Failed to create client. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Add New Client</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new client profile for your business
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 transition-colors relative ${
                activeTab === tab.id
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={tab.icon} size={18} />
              <span className="font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error Message */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {errors.submit}
            </div>
          )}

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Client Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., John Doe"
                    required
                    error={errors.name}
                    iconName="User"
                  />
                </div>
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="e.g., john.doe@example.com"
                    required
                    error={errors.email}
                    iconName="Mail"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g., (555) 123-4567"
                    error={errors.phone}
                    iconName="Phone"
                  />
                </div>
                <div>
                  <Input
                    label="Company Name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="e.g., ABC Corporation"
                    iconName="Building2"
                  />
                </div>
              </div>
              
              <div>
                <Input
                  label="Contact Person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  placeholder="e.g., Jane Smith (Project Manager)"
                  iconName="UserCheck"
                />
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              {errors.address && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-warning text-sm">
                  {errors.address}
                </div>
              )}
              
              <div>
                <Input
                  label="Street Address"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="e.g., 123 Main Street"
                  iconName="Home"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="City"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="e.g., Springfield"
                    iconName="Building"
                  />
                </div>
                <div>
                  <Input
                    label="State"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    placeholder="e.g., IL"
                    maxLength="2"
                    iconName="Map"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="ZIP Code"
                    value={formData.address.zip}
                    onChange={(e) => handleInputChange('address.zip', e.target.value)}
                    placeholder="e.g., 62701"
                    iconName="MapPin"
                  />
                </div>
                <div>
                  <Input
                    label="Country"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    placeholder="e.g., USA"
                    iconName="Globe"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Information Tab */}
          {activeTab === 'additional' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Client Type"
                    value={formData.client_type}
                    onChange={(value) => handleInputChange('client_type', value)}
                    options={clientTypes}
                    iconName="Users"
                  />
                </div>
                <div>
                  <Select
                    label="Payment Terms"
                    value={formData.payment_terms}
                    onChange={(value) => handleInputChange('payment_terms', value)}
                    options={paymentTerms}
                    iconName="CreditCard"
                  />
                </div>
              </div>
              
              <div>
                <Select
                  label="Preferred Contact Method"
                  value={formData.preferred_contact_method}
                  onChange={(value) => handleInputChange('preferred_contact_method', value)}
                  options={contactMethods}
                  iconName="MessageSquare"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any additional notes about this client..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows="4"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm text-foreground">
                  Mark this client as active
                </label>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-border bg-muted/30">
          <div className="text-sm text-muted-foreground">
            {activeTab === 'basic' && 'Step 1 of 3: Basic Information'}
            {activeTab === 'address' && 'Step 2 of 3: Address Details'}
            {activeTab === 'additional' && 'Step 3 of 3: Additional Information'}
          </div>
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              iconName={isLoading ? "Loader2" : "Save"}
              iconPosition="left"
              className={isLoading ? "animate-pulse" : ""}
            >
              {isLoading ? 'Creating Client...' : 'Create Client'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClientModal;