import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TemplateManagement = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Standard Quote Template",
      type: "quote",
      isDefault: true,
      lastModified: "2024-07-28",
      preview: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=400&fit=crop&crop=center"
    },
    {
      id: 2,
      name: "Detailed Invoice Template",
      type: "invoice",
      isDefault: true,
      lastModified: "2024-07-25",
      preview: "https://images.unsplash.com/photo-1554224154-26032fced8bd?w=300&h=400&fit=crop&crop=center"
    },
    {
      id: 3,
      name: "Progress Billing Template",
      type: "invoice",
      isDefault: false,
      lastModified: "2024-07-20",
      preview: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=300&h=400&fit=crop&crop=center"
    },
    {
      id: 4,
      name: "Material Quote Template",
      type: "quote",
      isDefault: false,
      lastModified: "2024-07-15",
      preview: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=400&fit=crop&crop=center"
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "quote",
    baseTemplate: ""
  });

  const templateTypes = [
    { value: "quote", label: "Quote Template" },
    { value: "invoice", label: "Invoice Template" }
  ];

  const baseTemplateOptions = [
    { value: "standard", label: "Standard Layout" },
    { value: "detailed", label: "Detailed Layout" },
    { value: "minimal", label: "Minimal Layout" },
    { value: "professional", label: "Professional Layout" }
  ];

  const handleSetDefault = (templateId) => {
    setTemplates(templates?.map(template => ({
      ...template,
      isDefault: template?.id === templateId ? true : 
                 (template?.type === templates?.find(t => t?.id === templateId)?.type ? false : template?.isDefault)
    })));
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplates(templates?.filter(template => template?.id !== templateId));
  };

  const handleCreateTemplate = () => {
    const template = {
      id: Date.now(),
      name: newTemplate?.name,
      type: newTemplate?.type,
      isDefault: false,
      lastModified: new Date()?.toISOString()?.split('T')?.[0],
      preview: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=400&fit=crop&crop=center"
    };
    setTemplates([...templates, template]);
    setShowCreateModal(false);
    setNewTemplate({ name: "", type: "quote", baseTemplate: "" });
  };

  const getTypeIcon = (type) => {
    return type === "quote" ? "FileText" : "Receipt";
  };

  const getTypeBadgeColor = (type) => {
    return type === "quote" ?"bg-accent text-accent-foreground" :"bg-primary text-primary-foreground";
  };

  return (
    <div className="bg-card rounded-lg border border-border construction-shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Template Management</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Customize quote and invoice templates for your business
            </p>
          </div>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setShowCreateModal(true)}
          >
            Create Template
          </Button>
        </div>
      </div>
      <div className="p-6">
        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <div key={template?.id} className="border border-border rounded-lg overflow-hidden construction-shadow-sm">
              {/* Template Preview */}
              <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                <Image
                  src={template?.preview}
                  alt={template?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 construction-transition">
                  <Button
                    variant="secondary"
                    iconName="Eye"
                    iconPosition="left"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    Preview
                  </Button>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground truncate">{template?.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${getTypeBadgeColor(template?.type)}`}>
                        {template?.type === "quote" ? "Quote" : "Invoice"}
                      </span>
                      {template?.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium rounded-md bg-success text-success-foreground">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Edit"
                      onClick={() => {}}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="MoreVertical"
                      onClick={() => {}}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  Last modified: {new Date(template.lastModified)?.toLocaleDateString()}
                </p>

                <div className="flex space-x-2">
                  {!template?.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(template?.id)}
                      className="flex-1"
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Copy"
                    onClick={() => {}}
                    className={template?.isDefault ? "flex-1" : ""}
                  >
                    Duplicate
                  </Button>
                  {!template?.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Trash2"
                      onClick={() => handleDeleteTemplate(template?.id)}
                      className="text-error hover:text-error"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Template Customization Options */}
        <div className="mt-8 border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Customization Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Icon name="Palette" size={20} className="text-muted-foreground" />
                <div>
                  <h5 className="text-sm font-medium text-foreground">Brand Colors</h5>
                  <p className="text-xs text-muted-foreground">Customize template colors</p>
                </div>
              </div>
              <Button variant="outline" size="sm" iconName="Settings" iconPosition="left">
                Configure Colors
              </Button>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Icon name="Type" size={20} className="text-muted-foreground" />
                <div>
                  <h5 className="text-sm font-medium text-foreground">Typography</h5>
                  <p className="text-xs text-muted-foreground">Font styles and sizes</p>
                </div>
              </div>
              <Button variant="outline" size="sm" iconName="Settings" iconPosition="left">
                Configure Fonts
              </Button>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Icon name="Layout" size={20} className="text-muted-foreground" />
                <div>
                  <h5 className="text-sm font-medium text-foreground">Layout Options</h5>
                  <p className="text-xs text-muted-foreground">Spacing and positioning</p>
                </div>
              </div>
              <Button variant="outline" size="sm" iconName="Settings" iconPosition="left">
                Configure Layout
              </Button>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Icon name="FileImage" size={20} className="text-muted-foreground" />
                <div>
                  <h5 className="text-sm font-medium text-foreground">Header & Footer</h5>
                  <p className="text-xs text-muted-foreground">Custom headers and footers</p>
                </div>
              </div>
              <Button variant="outline" size="sm" iconName="Settings" iconPosition="left">
                Configure Content
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border construction-shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Create New Template</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="X"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="Template Name"
                type="text"
                value={newTemplate?.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e?.target?.value})}
                placeholder="Enter template name"
                required
              />
              <Select
                label="Template Type"
                options={templateTypes}
                value={newTemplate?.type}
                onChange={(value) => setNewTemplate({...newTemplate, type: value})}
                required
              />
              <Select
                label="Base Template"
                options={baseTemplateOptions}
                value={newTemplate?.baseTemplate}
                onChange={(value) => setNewTemplate({...newTemplate, baseTemplate: value})}
                placeholder="Choose a starting template"
                required
              />
            </div>
            <div className="p-6 border-t border-border flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={handleCreateTemplate}
              >
                Create Template
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border construction-shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{selectedTemplate?.name}</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    iconName="Edit"
                    iconPosition="left"
                  >
                    Edit Template
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="X"
                    onClick={() => setSelectedTemplate(null)}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                <Image
                  src={selectedTemplate?.preview}
                  alt={selectedTemplate?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;