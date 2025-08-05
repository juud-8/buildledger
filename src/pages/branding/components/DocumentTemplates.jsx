import React, { useState, useEffect } from 'react';
import { brandingService } from '../../../services/brandingService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { FileText, Plus, Edit, Trash2, Copy, Eye } from 'lucide-react';

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
    } catch (err) {
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
    } catch (err) {
      onError?.('Failed to update document template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      onError?.(null);
      await brandingService?.deleteDocumentTemplate(templateId);
      setTemplates(prev => prev?.filter(t => t?.id !== templateId));
    } catch (err) {
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
    } catch (err) {
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
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Document Templates</h2>
              <p className="text-gray-600">Create branded templates for your documents</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>
      {/* Templates List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {templates?.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates created</h3>
            <p className="text-gray-600 mb-4">Create your first document template to get started.</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {templates?.map((template) => (
              <div key={template?.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {template?.template_name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template?.status === 'active' ?'bg-green-100 text-green-800' :'bg-gray-100 text-gray-800'
                      }`}>
                        {template?.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="capitalize">{template?.document_type?.replace('_', ' ')}</span>
                      <span>Logo: {template?.logo_position}</span>
                      <span>{template?.show_logo ? 'Logo visible' : 'No logo'}</span>
                      {template?.show_watermark && <span>Watermark enabled</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openEditModal(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template?.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Create/Edit Modal */}
      {(showCreateModal || editingTemplate) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <Input
                    value={formData?.template_name}
                    onChange={(e) => setFormData({ ...formData, template_name: e?.target?.value })}
                    placeholder="Enter template name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Position
                  </label>
                  <Select
                    value={formData?.logo_position}
                    onValueChange={(value) => setFormData({ ...formData, logo_position: value })}
                    options={logoPositionOptions}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Size
                  </label>
                  <Select
                    value={formData?.logo_size}
                    onValueChange={(value) => setFormData({ ...formData, logo_size: value })}
                    options={logoSizeOptions}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center">
                  <Checkbox
                    checked={formData?.show_logo}
                    onCheckedChange={(checked) => setFormData({ ...formData, show_logo: checked })}
                  />
                  <label className="ml-2 text-sm text-gray-700">Show logo</label>
                </div>
                
                <div className="flex items-center">
                  <Checkbox
                    checked={formData?.show_watermark}
                    onCheckedChange={(checked) => setFormData({ ...formData, show_watermark: checked })}
                  />
                  <label className="ml-2 text-sm text-gray-700">Show watermark</label>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t flex gap-3">
              <Button 
                onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                disabled={!formData?.template_name}
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
          </div>
        </div>
      )}
    </div>
  );
}