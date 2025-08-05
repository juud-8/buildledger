import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectDocuments = ({ project }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    { id: 'all', label: 'All Documents', count: project?.documents?.length },
    { id: 'contracts', label: 'Contracts', count: project?.documents?.filter(d => d?.category === 'contracts')?.length },
    { id: 'permits', label: 'Permits', count: project?.documents?.filter(d => d?.category === 'permits')?.length },
    { id: 'warranties', label: 'Warranties', count: project?.documents?.filter(d => d?.category === 'warranties')?.length },
    { id: 'invoices', label: 'Invoices', count: project?.documents?.filter(d => d?.category === 'invoices')?.length },
  ];

  const filteredDocuments = selectedCategory === 'all' 
    ? project?.documents 
    : project?.documents?.filter(doc => doc?.category === selectedCategory);

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return 'FileText';
      case 'doc': case'docx':
        return 'FileText';
      case 'xls': case'xlsx':
        return 'FileSpreadsheet';
      case 'jpg': case'jpeg': case'png':
        return 'Image';
      default:
        return 'File';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'signed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target?.files);
    if (files?.length > 0) {
      setIsUploading(true);
      // Simulate upload process
      setTimeout(() => {
        setIsUploading(false);
        // In real app, would handle file upload here
      }, 2000);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className="space-y-6">
      {/* Header with Upload */}
      <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Project Documents</h3>
            <p className="text-sm text-muted-foreground">Manage contracts, permits, warranties and other documents</p>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="document-upload"
            />
            <label htmlFor="document-upload">
              <Button
                variant="outline"
                iconName="Upload"
                iconPosition="left"
                loading={isUploading}
                className="cursor-pointer"
                asChild
              >
                <span>Upload Document</span>
              </Button>
            </label>
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
            >
              Create Document
            </Button>
          </div>
        </div>
      </div>
      {/* Category Filter */}
      <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
        <div className="flex flex-wrap gap-2">
          {categories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => setSelectedCategory(category?.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium construction-transition ${
                selectedCategory === category?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {category?.label} ({category?.count})
            </button>
          ))}
        </div>
      </div>
      {/* Documents List */}
      <div className="bg-card border border-border rounded-lg construction-shadow-sm">
        {filteredDocuments?.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredDocuments?.map((document, index) => (
              <div key={index} className="p-6 hover:bg-muted/50 construction-transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* File Icon */}
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={getFileIcon(document.fileType)} size={24} className="text-primary" />
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">{document.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
                          {document.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{document.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Icon name="Calendar" size={12} />
                          <span>Created: {document.createdDate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="User" size={12} />
                          <span>{document.uploadedBy}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="HardDrive" size={12} />
                          <span>{formatFileSize(document.size)}</span>
                        </div>
                        {document.version && (
                          <div className="flex items-center space-x-1">
                            <Icon name="GitBranch" size={12} />
                            <span>v{document.version}</span>
                          </div>
                        )}
                      </div>

                      {/* Digital Signature Info */}
                      {document.signatures && document.signatures?.length > 0 && (
                        <div className="mt-3 p-3 bg-background border border-border rounded-lg">
                          <h5 className="font-medium text-foreground mb-2 flex items-center">
                            <Icon name="PenTool" size={14} className="mr-1" />
                            Digital Signatures
                          </h5>
                          <div className="space-y-2">
                            {document.signatures?.map((signature, sigIndex) => (
                              <div key={sigIndex} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    signature?.status === 'signed' ? 'bg-green-500' : 'bg-yellow-500'
                                  }`}></div>
                                  <span className="text-foreground">{signature?.signer}</span>
                                </div>
                                <div className="text-muted-foreground">
                                  {signature?.status === 'signed' ? signature?.signedDate : 'Pending'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" iconName="Download">
                      Download
                    </Button>
                    <Button variant="ghost" size="sm" iconName="Eye">
                      View
                    </Button>
                    <Button variant="ghost" size="sm" iconName="Share">
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" iconName="MoreHorizontal">
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory === 'all' ?'Start organizing your project by uploading documents'
                : `No ${selectedCategory} documents found`
              }
            </p>
            <Button
              variant="outline"
              iconName="Upload"
              iconPosition="left"
              onClick={() => document.getElementById('document-upload')?.click()}
            >
              Upload First Document
            </Button>
          </div>
        )}
      </div>
      {/* Document Templates */}
      <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Document Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Construction Contract', icon: 'FileText', description: 'Standard construction agreement template' },
            { name: 'Change Order', icon: 'Edit', description: 'Project modification request form' },
            { name: 'Inspection Report', icon: 'Search', description: 'Quality inspection checklist' },
            { name: 'Safety Checklist', icon: 'Shield', description: 'Job site safety compliance form' },
            { name: 'Material Receipt', icon: 'Package', description: 'Material delivery confirmation' },
            { name: 'Progress Report', icon: 'TrendingUp', description: 'Weekly progress update template' },
          ]?.map((template, index) => (
            <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 construction-transition cursor-pointer">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={template?.icon} size={16} className="text-primary" />
                </div>
                <h4 className="font-medium text-foreground">{template?.name}</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{template?.description}</p>
              <Button variant="outline" size="sm" fullWidth>
                Use Template
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDocuments;