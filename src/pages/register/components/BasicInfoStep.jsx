import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const BasicInfoStep = ({ formData, setFormData, errors, setErrors }) => {
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password) => {
    const minLength = password?.length >= 8;
    const hasUpper = /[A-Z]/?.test(password);
    const hasLower = /[a-z]/?.test(password);
    const hasNumber = /\d/?.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/?.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      score: [minLength, hasUpper, hasLower, hasNumber, hasSpecial]?.filter(Boolean)?.length
    };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const passwordStrength = validatePassword(formData?.password || '');
  const getStrengthColor = (score) => {
    if (score <= 2) return 'bg-error';
    if (score <= 3) return 'bg-warning';
    return 'bg-success';
  };

  const getStrengthText = (score) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Create Your Account
        </h2>
        <p className="text-muted-foreground">
          Let's start with your basic information
        </p>
      </div>
      <div className="space-y-4">
        <Input
          label="Business Name"
          type="text"
          placeholder="Enter your construction business name"
          value={formData?.businessName || ''}
          onChange={(e) => handleInputChange('businessName', e?.target?.value)}
          error={errors?.businessName}
          required
        />

        <Input
          label="Owner Name"
          type="text"
          placeholder="Enter your full name"
          value={formData?.ownerName || ''}
          onChange={(e) => handleInputChange('ownerName', e?.target?.value)}
          error={errors?.ownerName}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your business email"
          value={formData?.email || ''}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          required
        />

        <div className="space-y-2">
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={formData?.password || ''}
              onChange={(e) => handleInputChange('password', e?.target?.value)}
              error={errors?.password}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground construction-transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
            </button>
          </div>

          {formData?.password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Password Strength:</span>
                <span className={`text-sm font-medium ${
                  passwordStrength?.score <= 2 ? 'text-error' :
                  passwordStrength?.score <= 3 ? 'text-warning' : 'text-success'
                }`}>
                  {getStrengthText(passwordStrength?.score)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full construction-transition ${getStrengthColor(passwordStrength?.score)}`}
                  style={{ width: `${(passwordStrength?.score / 5) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className={`flex items-center space-x-2 ${passwordStrength?.minLength ? 'text-success' : ''}`}>
                  <Icon name={passwordStrength?.minLength ? "Check" : "X"} size={12} />
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center space-x-2 ${passwordStrength?.hasUpper ? 'text-success' : ''}`}>
                  <Icon name={passwordStrength?.hasUpper ? "Check" : "X"} size={12} />
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 ${passwordStrength?.hasNumber ? 'text-success' : ''}`}>
                  <Icon name={passwordStrength?.hasNumber ? "Check" : "X"} size={12} />
                  <span>One number</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Input
          label="Phone Number"
          type="tel"
          placeholder="(555) 123-4567"
          value={formData?.phone || ''}
          onChange={(e) => handleInputChange('phone', e?.target?.value)}
          error={errors?.phone}
          required
        />
      </div>
    </div>
  );
};

export default BasicInfoStep;