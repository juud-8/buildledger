import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BusinessInfoStep = ({ formData, setFormData, errors, setErrors }) => {
  const businessTypes = [
    { value: 'general-contractor', label: 'General Contractor' },
    { value: 'specialty-contractor', label: 'Specialty Contractor' },
    { value: 'residential-builder', label: 'Residential Builder' },
    { value: 'commercial-builder', label: 'Commercial Builder' },
    { value: 'renovation-contractor', label: 'Renovation Contractor' },
    { value: 'landscaping-contractor', label: 'Landscaping Contractor' },
    { value: 'electrical-contractor', label: 'Electrical Contractor' },
    { value: 'plumbing-contractor', label: 'Plumbing Contractor' },
    { value: 'roofing-contractor', label: 'Roofing Contractor' },
    { value: 'hvac-contractor', label: 'HVAC Contractor' },
    { value: 'other', label: 'Other' }
  ];

  const yearsInBusiness = [
    { value: '0-1', label: 'Less than 1 year' },
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10-20', label: '10-20 years' },
    { value: '20+', label: '20+ years' }
  ];

  const projectSizeRanges = [
    { value: 'under-10k', label: 'Under $10,000' },
    { value: '10k-50k', label: '$10,000 - $50,000' },
    { value: '50k-100k', label: '$50,000 - $100,000' },
    { value: '100k-500k', label: '$100,000 - $500,000' },
    { value: '500k-1m', label: '$500,000 - $1,000,000' },
    { value: 'over-1m', label: 'Over $1,000,000' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatLicenseNumber = (value) => {
    // Remove all non-alphanumeric characters
    const cleaned = value?.replace(/[^a-zA-Z0-9]/g, '');
    
    // Format as XXX-XXXXXX if it's numeric, otherwise keep as is
    if (/^\d+$/?.test(cleaned) && cleaned?.length >= 6) {
      return cleaned?.replace(/(\d{3})(\d{6})/, '$1-$2');
    }
    
    return cleaned;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Business Information
        </h2>
        <p className="text-muted-foreground">
          Tell us about your construction business
        </p>
      </div>
      <div className="space-y-4">
        <Select
          label="Business Type"
          placeholder="Select your business type"
          options={businessTypes}
          value={formData?.businessType || ''}
          onChange={(value) => handleInputChange('businessType', value)}
          error={errors?.businessType}
          required
          searchable
        />

        <Input
          label="License Number"
          type="text"
          placeholder="Enter your contractor license number"
          value={formData?.licenseNumber || ''}
          onChange={(e) => handleInputChange('licenseNumber', formatLicenseNumber(e?.target?.value))}
          error={errors?.licenseNumber}
          description="Format: XXX-XXXXXX or your state's format"
        />

        <Select
          label="Years in Business"
          placeholder="How long have you been in business?"
          options={yearsInBusiness}
          value={formData?.yearsInBusiness || ''}
          onChange={(value) => handleInputChange('yearsInBusiness', value)}
          error={errors?.yearsInBusiness}
          required
        />

        <Select
          label="Typical Project Size"
          placeholder="Select your typical project value range"
          options={projectSizeRanges}
          value={formData?.projectSize || ''}
          onChange={(value) => handleInputChange('projectSize', value)}
          error={errors?.projectSize}
          description="This helps us customize features for your business size"
          required
        />

        <Input
          label="Business Address"
          type="text"
          placeholder="Enter your business address"
          value={formData?.businessAddress || ''}
          onChange={(e) => handleInputChange('businessAddress', e?.target?.value)}
          error={errors?.businessAddress}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="City"
            type="text"
            placeholder="City"
            value={formData?.city || ''}
            onChange={(e) => handleInputChange('city', e?.target?.value)}
            error={errors?.city}
            required
          />

          <Input
            label="State"
            type="text"
            placeholder="State"
            value={formData?.state || ''}
            onChange={(e) => handleInputChange('state', e?.target?.value)}
            error={errors?.state}
            required
          />
        </div>

        <Input
          label="ZIP Code"
          type="text"
          placeholder="12345"
          value={formData?.zipCode || ''}
          onChange={(e) => handleInputChange('zipCode', e?.target?.value)}
          error={errors?.zipCode}
          required
        />
      </div>
    </div>
  );
};

export default BusinessInfoStep;