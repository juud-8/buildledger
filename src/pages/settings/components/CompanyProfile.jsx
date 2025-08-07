import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { showErrorToast, showSuccessToast } from '../../../utils/toastHelper';
import { useOnboarding } from '../../../contexts/OnboardingContext';

const CompanyProfile = () => {
  const { currentStep, steps, completeStep } = useOnboarding();
  const [companyData, setCompanyData] = useState({
    companyName: "BuildLedger Construction Co.",
    businessType: "general-contractor",
    licenseNumber: "CL-2024-789456",
    taxId: "12-3456789",
    phone: "(555) 123-4567",
    email: "info@buildledger.com",
    website: "www.buildledger.com",
    address: "1234 Construction Ave",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentStep === 'companyInfo' && !steps.companyInfo) {
      setIsEditing(true);
    }
  }, [currentStep, steps.companyInfo]);

  const businessTypes = [
    { value: "general-contractor", label: "General Contractor" },
    { value: "specialty-contractor", label: "Specialty Contractor" },
    { value: "subcontractor", label: "Subcontractor" },
    { value: "construction-manager", label: "Construction Manager" },
    { value: "design-build", label: "Design-Build" }
  ];

  const stateOptions = [
    { value: "TX", label: "Texas" },
    { value: "CA", label: "California" },
    { value: "FL", label: "Florida" },
    { value: "NY", label: "New York" },
    { value: "IL", label: "Illinois" }
  ];

  const handleInputChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    
    if (currentStep === 'companyInfo') {
      completeStep('companyInfo');
      showSuccessToast('Company profile updated! Ready for the next step.');
    } else {
      showSuccessToast('Company profile updated successfully!');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
  };

  const handleLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        uploadLogo(file);
      } else {
        showErrorToast('Please select a valid image file (JPG, PNG, SVG)');
      }
    }
  };

  const uploadLogo = async (file) => {
    try {
      setUploading(true);
      
      // Create a temporary URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      
      // Update the company data with the new logo
      setCompanyData(prev => ({
        ...prev,
        logo: imageUrl
      }));
      
      // In a real app, you would upload to a server here
      console.log('Logo uploaded:', file.name);
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      showErrorToast('Failed to upload logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border construction-shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Company Profile</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your company information and branding
            </p>
          </div>
          {!isEditing ? (
            <Button
              variant="outline"
              iconName="Edit"
              iconPosition="left"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                iconName="Save"
                iconPosition="left"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Company Logo */}
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-border">
              <Image
                src={companyData?.logo}
                alt="Company Logo"
                className="w-full h-full object-cover"
              />
            </div>
            {isEditing && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Upload"
                  iconPosition="left"
                  className="mt-2 w-full"
                  onClick={handleLogoUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
              </>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground mb-2">Company Logo</h4>
            <p className="text-sm text-muted-foreground">
              Upload your company logo. Recommended size: 200x200px. Supported formats: JPG, PNG, SVG.
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Company Name"
            type="text"
            value={companyData?.companyName}
            onChange={(e) => handleInputChange('companyName', e?.target?.value)}
            disabled={!isEditing}
            required
          />

          <Select
            label="Business Type"
            options={businessTypes}
            value={companyData?.businessType}
            onChange={(value) => handleInputChange('businessType', value)}
            disabled={!isEditing}
            required
          />

          <Input
            label="License Number"
            type="text"
            value={companyData?.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e?.target?.value)}
            disabled={!isEditing}
            description="Your contractor license number"
          />

          <Input
            label="Tax ID / EIN"
            type="text"
            value={companyData?.taxId}
            onChange={(e) => handleInputChange('taxId', e?.target?.value)}
            disabled={!isEditing}
            description="Federal Tax Identification Number"
          />
        </div>

        {/* Contact Information */}
        <div className="border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Phone Number"
              type="tel"
              value={companyData?.phone}
              onChange={(e) => handleInputChange('phone', e?.target?.value)}
              disabled={!isEditing}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={companyData?.email}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              disabled={!isEditing}
              required
            />

            <Input
              label="Website"
              type="url"
              value={companyData?.website}
              onChange={(e) => handleInputChange('website', e?.target?.value)}
              disabled={!isEditing}
              description="Optional"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Business Address</h4>
          <div className="space-y-4">
            <Input
              label="Street Address"
              type="text"
              value={companyData?.address}
              onChange={(e) => handleInputChange('address', e?.target?.value)}
              disabled={!isEditing}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                type="text"
                value={companyData?.city}
                onChange={(e) => handleInputChange('city', e?.target?.value)}
                disabled={!isEditing}
                required
              />

              <Select
                label="State"
                options={stateOptions}
                value={companyData?.state}
                onChange={(value) => handleInputChange('state', value)}
                disabled={!isEditing}
                required
              />

              <Input
                label="ZIP Code"
                type="text"
                value={companyData?.zipCode}
                onChange={(e) => handleInputChange('zipCode', e?.target?.value)}
                disabled={!isEditing}
                required
              />
            </div>
          </div>
        </div>

        {/* Branding Settings */}
        <div className="border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Branding & Customization</h4>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Icon name="Palette" size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Custom Branding</p>
                <p className="text-xs text-muted-foreground">
                  Customize quote and invoice templates with your brand colors and styling
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                iconName="ExternalLink"
                iconPosition="right"
                disabled={!isEditing}
              >
                Customize
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;