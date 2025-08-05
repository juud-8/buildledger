import React, { useState, useEffect, useRef } from 'react';
import { brandingService } from '../../../services/brandingService';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Upload, Image, Trash2, Star, Download, Eye } from 'lucide-react';

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
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Loading logos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload New Logo</h2>
            <p className="text-gray-600">Add logos for different use cases</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Type
            </label>
            <Select
              value={selectedLogoType}
              onValueChange={setSelectedLogoType}
              options={logoTypeOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Logo
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
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
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Uploading...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    Drop your logo here or{' '}
                    <button
                      onClick={() => fileInputRef?.current?.click()}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, SVG, WebP up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Logo Gallery */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Image className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Logo Gallery</h2>
            <p className="text-gray-600">Manage all your logo variations</p>
          </div>
        </div>

        {logos?.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No logos uploaded</h3>
            <p className="text-gray-600">Upload your first logo to get started with branding.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos?.map((logo) => (
              <div key={logo?.id} className="border rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-50 flex items-center justify-center p-4">
                  <img
                    src={logo?.public_url}
                    alt={logo?.file_name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 truncate">
                        {logo?.file_name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {logo?.logo_type?.replace('_', ' ')}
                      </p>
                    </div>
                    {logo?.is_primary && (
                      <div className="flex items-center text-yellow-600">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(logo?.public_url, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadLogo(logo)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {!logo?.is_primary && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetPrimary(logo?.id)}
                        className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteLogo(logo?.id, logo?.file_path)}
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
    </div>
  );
}