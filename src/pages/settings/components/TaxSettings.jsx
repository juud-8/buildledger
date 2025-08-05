import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const TaxSettings = () => {
  const [taxSettings, setTaxSettings] = useState({
    defaultTaxRate: "8.25",
    taxName: "Sales Tax",
    taxNumber: "TX-789456123",
    compoundTax: false,
    taxInclusive: false,
    exemptionCertificate: true,
    state: "TX",
    county: "Travis",
    city: "Austin"
  });

  const [customRates, setCustomRates] = useState([
    {
      id: 1,
      name: "Materials Tax",
      rate: "6.25",
      description: "Tax rate for construction materials",
      active: true
    },
    {
      id: 2,
      name: "Labor Tax",
      rate: "0.00",
      description: "Tax rate for labor services",
      active: true
    },
    {
      id: 3,
      name: "Equipment Rental Tax",
      rate: "8.25",
      description: "Tax rate for equipment rentals",
      active: false
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);

  const stateOptions = [
    { value: "TX", label: "Texas" },
    { value: "CA", label: "California" },
    { value: "FL", label: "Florida" },
    { value: "NY", label: "New York" },
    { value: "IL", label: "Illinois" }
  ];

  const handleInputChange = (field, value) => {
    setTaxSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
  };

  const addCustomRate = () => {
    const newRate = {
      id: Date.now(),
      name: "New Tax Rate",
      rate: "0.00",
      description: "",
      active: true
    };
    setCustomRates([...customRates, newRate]);
  };

  const updateCustomRate = (id, field, value) => {
    setCustomRates(customRates?.map(rate => 
      rate?.id === id ? { ...rate, [field]: value } : rate
    ));
  };

  const removeCustomRate = (id) => {
    setCustomRates(customRates?.filter(rate => rate?.id !== id));
  };

  return (
    <div className="bg-card rounded-lg border border-border construction-shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Tax Settings</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure tax rates and compliance settings
            </p>
          </div>
          {!isEditing ? (
            <Button
              variant="outline"
              iconName="Edit"
              iconPosition="left"
              onClick={() => setIsEditing(true)}
            >
              Edit Settings
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
        {/* Default Tax Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Default Tax Rate (%)"
            type="number"
            value={taxSettings?.defaultTaxRate}
            onChange={(e) => handleInputChange('defaultTaxRate', e?.target?.value)}
            disabled={!isEditing}
            description="Default tax rate applied to quotes and invoices"
            required
          />

          <Input
            label="Tax Name"
            type="text"
            value={taxSettings?.taxName}
            onChange={(e) => handleInputChange('taxName', e?.target?.value)}
            disabled={!isEditing}
            description="Display name for tax on documents"
            required
          />

          <Input
            label="Tax Registration Number"
            type="text"
            value={taxSettings?.taxNumber}
            onChange={(e) => handleInputChange('taxNumber', e?.target?.value)}
            disabled={!isEditing}
            description="Your business tax registration number"
          />

          <Select
            label="State"
            options={stateOptions}
            value={taxSettings?.state}
            onChange={(value) => handleInputChange('state', value)}
            disabled={!isEditing}
            required
          />
        </div>

        {/* Tax Options */}
        <div className="border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Tax Calculation Options</h4>
          <div className="space-y-4">
            <Checkbox
              label="Compound Tax"
              description="Apply tax on top of other taxes"
              checked={taxSettings?.compoundTax}
              onChange={(e) => handleInputChange('compoundTax', e?.target?.checked)}
              disabled={!isEditing}
            />

            <Checkbox
              label="Tax Inclusive Pricing"
              description="Prices include tax (tax is calculated from the total)"
              checked={taxSettings?.taxInclusive}
              onChange={(e) => handleInputChange('taxInclusive', e?.target?.checked)}
              disabled={!isEditing}
            />

            <Checkbox
              label="Accept Tax Exemption Certificates"
              description="Allow clients to provide tax exemption certificates"
              checked={taxSettings?.exemptionCertificate}
              onChange={(e) => handleInputChange('exemptionCertificate', e?.target?.checked)}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Custom Tax Rates */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-medium text-foreground">Custom Tax Rates</h4>
              <p className="text-sm text-muted-foreground">
                Create specific tax rates for different types of work
              </p>
            </div>
            {isEditing && (
              <Button
                variant="outline"
                iconName="Plus"
                iconPosition="left"
                onClick={addCustomRate}
                size="sm"
              >
                Add Rate
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {customRates?.map((rate) => (
              <div key={rate?.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Rate Name"
                      type="text"
                      value={rate?.name}
                      onChange={(e) => updateCustomRate(rate?.id, 'name', e?.target?.value)}
                      disabled={!isEditing}
                    />

                    <Input
                      label="Tax Rate (%)"
                      type="number"
                      value={rate?.rate}
                      onChange={(e) => updateCustomRate(rate?.id, 'rate', e?.target?.value)}
                      disabled={!isEditing}
                    />

                    <div className="flex items-end">
                      <Checkbox
                        label="Active"
                        checked={rate?.active}
                        onChange={(e) => updateCustomRate(rate?.id, 'active', e?.target?.checked)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Trash2"
                      onClick={() => removeCustomRate(rate?.id)}
                      className="text-error hover:text-error ml-2"
                    />
                  )}
                </div>

                {rate?.description && (
                  <div className="mt-2">
                    <Input
                      label="Description"
                      type="text"
                      value={rate?.description}
                      onChange={(e) => updateCustomRate(rate?.id, 'description', e?.target?.value)}
                      disabled={!isEditing}
                      placeholder="Optional description"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tax Compliance */}
        <div className="border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Compliance & Reporting</h4>
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Icon name="FileText" size={20} className="text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Tax Reports</p>
                <p className="text-xs text-muted-foreground">
                  Generate tax reports for filing and compliance
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
              >
                Generate Report
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Icon name="Calendar" size={20} className="text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Filing Reminders</p>
                <p className="text-xs text-muted-foreground">
                  Set up automatic reminders for tax filing deadlines
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                iconName="Bell"
                iconPosition="left"
              >
                Set Reminders
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Icon name="Shield" size={20} className="text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Audit Trail</p>
                <p className="text-xs text-muted-foreground">
                  Maintain detailed records of all tax calculations
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                iconName="Eye"
                iconPosition="left"
              >
                View Audit Log
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxSettings;