import React, { useState, useEffect, useRef } from 'react';
import { brandingService } from '../../../services/brandingService';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import Icon from '../../../components/AppIcon';
import { showSuccessToast, showErrorToast } from '../../../utils/toastHelper';

export function LogoManagement({ branding, userId, onError }) {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedLogoType, setSelectedLogoType] = useState('full_logo');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const logoTypeOptions = [
    { value: 'full_logo', label: 'Full Logo' },
    { value: 'icon_only', label: 'Icon Only' },
    { value: 'horizontal', label: 'Horizontal Layout' },
    { value: 'vertical', label: 'Vertical Layout' },
    { value: 'watermark', label: 'Watermark' }
  ];

  useEffect(() => {
    if (userId) {
      loadLogos();
    }
  }, [userId]);

  const loadLogos = async () => {
    try {
      setLoading(true);
      onError?.(null);
      const data = await brandingService?.getLogoAssets(userId);
      setLogos(data?.map(logo => ({
        ...logo,
        public_url: brandingService?.getLogoUrl(logo?.file_path)
      })) || []);
    } catch (err) {
      onError?.('Failed to load logos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file?.type?.startsWith('image/')) {
      uploadLogo(file);
    } else {
      onError?.('Please select a valid image file (PNG, JPG, SVG, WebP)');
    }
  };

  const uploadLogo = async (file) => {
    try {
      setUploading(true);
      onError?.(null);
      
      const optimizedFile = await brandingService?.optimizeImage(file);
      const newLogo = await brandingService?.uploadLogo(
        optimizedFile || file, 
        selectedLogoType, 
        userId, 
        branding?.id
      );
      
      setLogos(prev => [newLogo, ...prev]);
    } catch (err) {
      onError?.('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLogo = async (logoId, filePath) => {
    if (!confirm('Are you sure you want to delete this logo?')) return;
    
    try {
      onError?.(null);
      await brandingService?.deleteLogo(logoId, filePath);
      setLogos(prev => prev?.filter(logo => logo?.id !== logoId));
    } catch (err) {
      onError?.('Failed to delete logo');
    }
  };

  const handleSetPrimary = async (logoId) => {
    try {
      onError?.(null);
      await brandingService?.setPrimaryLogo(logoId, userId);
      setLogos(prev => prev?.map(logo => ({
        ...logo,
        is_primary: logo?.id === logoId
      })));
    } catch (err) {
      onError?.('Failed to set primary logo');
    }
  };

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    if (files?.length > 0) {
      handleFileSelect(files?.[0]);
    }
  };

  const downloadLogo = (logo) => {
    const link = document.createElement('a');
    link.href = logo?.public_url;
    link.download = logo?.file_name;
    link?.click();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={32} className="animate-spin text-primary mr-3" />
          <p className="text-muted-foreground">Loading logos...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6 bg-card border border-border construction-shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon name="Upload" size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Upload New Logo</h2>
            <p className="text-muted-foreground">Add logos for different use cases and document types</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Logo Type
            </label>
            <Select
              value={selectedLogoType}
              onValueChange={setSelectedLogoType}
              options={logoTypeOptions}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Choose the appropriate type for your logo's intended use
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Upload Logo File
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e?.target?.files?.[0])}
                className="hidden"
              />
              
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Icon name="Loader2" size={32} className="animate-spin text-primary mb-3" />
                  <span className="text-foreground font-medium">Uploading logo...</span>
                  <span className="text-muted-foreground text-sm">Please wait while we process your file</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Icon name="Upload" size={32} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium mb-1">
                      Drop your logo here or{' '}
                      <button
                        onClick={() => fileInputRef?.current?.click()}
                        className="text-primary hover:text-primary/80 font-semibold underline transition-colors"
                      >
                        browse files
                      </button>
                    </p>
                    <p className="text-muted-foreground text-sm">
                      PNG, JPG, SVG, WebP up to 10MB • High resolution recommended
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      {/* Logo Gallery */}
      <Card className="p-6 bg-card border border-border construction-shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-construction/10 rounded-xl flex items-center justify-center">
            <Icon name="Image" size={24} className="text-construction" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Logo Gallery</h2>
            <p className="text-muted-foreground">Manage all your logo variations and set primary logos</p>
          </div>
        </div>

        {logos?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Image" size={48} className="text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No logos uploaded yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload your first logo using the form above to start building your brand identity. 
              You can upload different variations for different use cases.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos?.map((logo) => (
              <div key={logo?.id} className="group border border-border rounded-xl overflow-hidden construction-shadow-sm hover:construction-shadow-md transition-all duration-200">
                <div className="aspect-video bg-muted/20 flex items-center justify-center p-6 relative">
                  <img
                    src={logo?.public_url}
                    alt={logo?.file_name}
                    className="max-w-full max-h-full object-contain drop-shadow-sm"
                  />
                  {logo?.is_primary && (
                    <div className="absolute top-3 right-3 bg-warning text-warning-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Icon name="Star" size={12} />
                      Primary
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-card">
                  <div className="mb-4">
                    <h3 className="font-semibold text-foreground truncate mb-1">
                      {logo?.file_name}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {logo?.logo_type?.replace('_', ' ')} • {logo?.file_size ? `${Math.round(logo.file_size / 1024)}KB` : 'Unknown size'}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(logo?.public_url, '_blank')}
                      iconName="Eye"
                      className="flex-1 min-w-0"
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadLogo(logo)}
                      iconName="Download"
                      className="flex-1 min-w-0"
                    >
                      Download
                    </Button>
                    {!logo?.is_primary && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetPrimary(logo?.id)}
                        iconName="Star"
                        className="text-warning hover:bg-warning/10 hover:border-warning/50"
                      >
                        Set Primary
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteLogo(logo?.id, logo?.file_path)}
                      iconName="Trash2"
                      className="text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}