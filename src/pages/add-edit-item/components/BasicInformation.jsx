import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const BasicInformation = ({ formData, errors, onChange }) => {
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    { value: 'materials', label: 'Materials', icon: 'Package' },
    { value: 'labor', label: 'Labor', icon: 'Users' },
    { value: 'equipment', label: 'Equipment', icon: 'Truck' },
    { value: 'subcontractor', label: 'Subcontractor', icon: 'Handshake' },
    { value: 'other', label: 'Other', icon: 'MoreHorizontal' }
  ];

  const units = [
    { value: 'each', label: 'Each' },
    { value: 'hour', label: 'Hour' },
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'linear_foot', label: 'Linear Foot' },
    { value: 'square_foot', label: 'Square Foot' },
    { value: 'cubic_foot', label: 'Cubic Foot' },
    { value: 'cubic_yard', label: 'Cubic Yard' },
    { value: 'square', label: 'Square (Roofing)' },
    { value: 'pound', label: 'Pound' },
    { value: 'ton', label: 'Ton' },
    { value: 'gallon', label: 'Gallon' },
    { value: 'case', label: 'Case' },
    { value: 'roll', label: 'Roll' },
    { value: 'sheet', label: 'Sheet' }
  ];

  const handleImageUpload = (event) => {
    const file = event.target?.files?.[0];
    if (file) {
      onChange?.('image', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e?.target?.result);
      };
      reader?.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onChange?.('image', null);
    setImagePreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Info" size={20} className="mr-2" />
          Basic Information
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Item Name *
              </label>
              <Input
                type="text"
                placeholder="Enter item name"
                value={formData?.name || ''}
                onChange={(e) => onChange?.('name', e?.target?.value)}
                error={errors?.name}
              />
              {errors?.name && (
                <p className="text-sm text-error mt-1">{errors?.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter item description"
                value={formData?.description || ''}
                onChange={(e) => onChange?.('description', e?.target?.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <Select
                options={categories}
                value={formData?.category || ''}
                onChange={(val) => onChange?.('category', val)}
                placeholder="Select category (optional)"
                clearable
              />
              {errors?.category && (
                <p className="text-sm text-error mt-1">{errors?.category}</p>
              )}
            </div>

            {/* Unit of Measurement */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Unit of Measurement *
              </label>
              <Select
                options={units}
                value={formData?.unit || ''}
                onChange={(val) => onChange?.('unit', val)}
                placeholder="Select unit (optional)"
                clearable
              />
              {errors?.unit && (
                <p className="text-sm text-error mt-1">{errors?.unit}</p>
              )}
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Item Image
              </label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary construction-transition">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Item preview"
                    className="w-full h-48 object-cover rounded-lg border border-border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    iconName="X"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  />
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                <Icon name="Lightbulb" size={16} className="mr-2" />
                Tips for Better Item Management
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use clear, descriptive names for easy searching</li>
                <li>• Include material specifications in descriptions</li>
                <li>• Choose the most appropriate category for filtering</li>
                <li>• Select the correct unit for accurate pricing</li>
                <li>• Add images to help with visual identification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInformation;