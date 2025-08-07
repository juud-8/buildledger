import React, { useState, useEffect } from 'react';
import { brandingService } from '../../../services/brandingService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Card } from '../../../components/ui/Card';
import Icon from '../../../components/AppIcon';
import { showSuccessToast, showErrorToast } from '../../../utils/toastHelper';

export function DocumentTemplates({ branding, userId, onError }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    template_name: '',
    document_type: 'invoice',
    logo_position: 'top-left',
    logo_size: 'medium',
    show_logo: true,
    show_watermark: false,
    template_config: {}
  });

  const documentTypeOptions = [
    { value: 'invoice', label: 'Invoice' },
    { value: 'quote', label: 'Quote' },
    { value: 'letterhead', label: 'Letterhead' },
    { value: 'business_card', label: 'Business Card' },
    { value: 'email_signature', label: 'Email Signature' }
  ];

  const logoPositionOptions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' }
  ];

  const logoSizeOptions = [
    { value: 'small', label: 'Small (100px)' },
    { value: 'medium', label: 'Medium (150px)' },
    { value: 'large', label: 'Large (200px)' },
    { value: 'custom', label: 'Custom Size' }
  ];

  useEffect(() => {
    if (userId) {
      loadTemplates();
    }
  }, [userId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      onError?.(null);
      const data = await brandingService?.getDocumentTemplates(userId);
      setTemplates(data || []);
    } catch (err) {
      onError?.('Failed to load document templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      onError?.(null);
      const templateData = {
        ...formData,
        status: 'active'
      };
      
      const newTemplate = await brandingService?.createDocumentTemplate(userId, templateData);
      setTemplates(prev => [newTemplate, ...prev]);
      setShowCreateModal(false);
      resetForm();
      showSuccessToast('Document template created successfully!');
    } catch (err) {
      showErrorToast('Failed to create document template', err);
      onError?.('Failed to create document template');
    }
  };

  const handleUpdateTemplate = async () => {
    try {
      onError?.(null);
      const updatedTemplate = await brandingService?.updateDocumentTemplate(
        userId,
        editingTemplate?.id, 
        formData
      );
      setTemplates(prev => prev?.map(t => t?.id === editingTemplate?.id ? updatedTemplate : t));
      setEditingTemplate(null);
      resetForm();
      showSuccessToast('Template updated successfully!');
    } catch (err) {
      showErrorToast('Failed to update document template', err);
      onError?.('Failed to update document template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      onError?.(null);
      await brandingService?.deleteDocumentTemplate(templateId);
      setTemplates(prev => prev?.filter(t => t?.id !== templateId));
      showSuccessToast('Template deleted successfully!');
    } catch (err) {
      showErrorToast('Failed to delete document template', err);
      onError?.('Failed to delete document template');
    }
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      onError?.(null);
      const duplicateData = {
        ...template,
        template_name: `${template?.template_name} (Copy)`,
        user_id: userId,
        branding_id: branding?.id,
        status: 'draft'
      };
      delete duplicateData?.id;
      delete duplicateData?.created_at;
      delete duplicateData?.updated_at;
      
      const newTemplate = await brandingService?.createDocumentTemplate(duplicateData);
      setTemplates(prev => [newTemplate, ...prev]);
      showSuccessToast('Template duplicated successfully!');
    } catch (err) {
      showErrorToast('Failed to duplicate template', err);
      onError?.('Failed to duplicate template');
    }
  };

  const resetForm = () => {
    setFormData({
      template_name: '',
      document_type: 'invoice',
      logo_position: 'top-left',
      logo_size: 'medium',
      show_logo: true,
      show_watermark: false,
      template_config: {}
    });
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template?.template_name,
      document_type: template?.document_type,
      logo_position: template?.logo_position,
      logo_size: template?.logo_size,
      show_logo: template?.show_logo,
      show_watermark: template?.show_watermark,
      template_config: template?.template_config || {}
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={32} className="animate-spin text-primary mr-3" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-card border border-border construction-shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <Icon name="FileText" size={24} className="text-success" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Document Templates</h2>
              <p className="text-muted-foreground">Create branded templates for your documents and communications</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)} iconName="Plus" iconPosition="left">
            New Template
          </Button>
        </div>
      </Card>
      {/* Templates List */}
      <Card className="bg-card border border-border construction-shadow-sm">
        {templates?.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="FileText" size={48} className="text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No templates created yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Create your first document template to establish consistent branding across all your business communications.
            </p>
            <Button onClick={() => setShowCreateModal(true)} iconName="Plus" iconPosition="left">
              Create Your First Template
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {templates?.map((template) => (
              <div key={template?.id} className="p-6 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon 
                          name={template?.document_type === 'invoice' ? 'Receipt' : 
                                template?.document_type === 'quote' ? 'Calculator' :
                                template?.document_type === 'letterhead' ? 'FileText' :
                                template?.document_type === 'business_card' ? 'CreditCard' :
                                'Mail'} 
                          size={20} 
                          className="text-primary" 
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {template?.template_name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            template?.status === 'active' 
                              ? 'bg-success/10 text-success border border-success/20' 
                              : 'bg-muted text-muted-foreground border border-border'
                          }`}>
                            {template?.status}
                          </span>
                          <span className="text-sm text-muted-foreground capitalize">
                            {template?.document_type?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icon name="MapPin" size={14} />
                        <span>Logo: {template?.logo_position?.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name={template?.show_logo ? 'Eye' : 'EyeOff'} size={14} />
                        <span>{template?.show_logo ? 'Logo visible' : 'No logo'}</span>
                      </div>
                      {template?.show_watermark && (
                        <div className="flex items-center gap-1">
                          <Icon name="Layers" size={14} />
                          <span>Watermark enabled</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" iconName="Eye" />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDuplicateTemplate(template)}
                      iconName="Copy"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openEditModal(template)}
                      iconName="Edit"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template?.id)}
                      iconName="Trash2"
                      className="text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {/* Create/Edit Modal */}
      {(showCreateModal || editingTemplate) && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-card border-border construction-shadow-lg">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={editingTemplate ? 'Edit' : 'Plus'} size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {editingTemplate ? 'Edit Template' : 'Create New Template'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {editingTemplate ? 'Update your template settings' : 'Configure your new document template'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="X"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTemplate(null);
                      resetForm();
                    }}
                  />
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Template Name
                    </label>
                    <Input
                      value={formData?.template_name}
                      onChange={(e) => setFormData({ ...formData, template_name: e?.target?.value })}
                      placeholder="Enter template name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Document Type
                    </label>
                    <Select
                      value={formData?.document_type}
                      onValueChange={(value) => setFormData({ ...formData, document_type: value })}
                      options={documentTypeOptions}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Logo Position
                    </label>
                    <Select
                      value={formData?.logo_position}
                      onValueChange={(value) => setFormData({ ...formData, logo_position: value })}
                      options={logoPositionOptions}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Logo Size
                    </label>
                    <Select
                      value={formData?.logo_size}
                      onValueChange={(value) => setFormData({ ...formData, logo_size: value })}
                      options={logoSizeOptions}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Display Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <Checkbox
                        checked={formData?.show_logo}
                        onCheckedChange={(checked) => setFormData({ ...formData, show_logo: checked })}
                      />
                      <div>
                        <label className="text-sm font-medium text-foreground">Show logo</label>
                        <p className="text-xs text-muted-foreground">Include company logo in template</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <Checkbox
                        checked={formData?.show_watermark}
                        onCheckedChange={(checked) => setFormData({ ...formData, show_watermark: checked })}
                      />
                      <div>
                        <label className="text-sm font-medium text-foreground">Show watermark</label>
                        <p className="text-xs text-muted-foreground">Add subtle background watermark</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-border flex gap-3">
                <Button 
                  onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  disabled={!formData?.template_name}
                  iconName={editingTemplate ? 'Save' : 'Plus'}
                  iconPosition="left"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}