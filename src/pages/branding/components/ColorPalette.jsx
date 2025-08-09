import React, { useState } from 'react';
import { brandingService } from '../../../services/brandingService';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import Icon from '../../../components/AppIcon';
import { showSuccessToast, showErrorToast } from '../../../utils/toastHelper';

export function ColorPalette({ branding, onUpdate, onError }) {
  const { user } = useAuth();
  const [colors, setColors] = useState({
    primary_color: branding?.primary_color || '#3B82F6',
    secondary_color: branding?.secondary_color || '#1E40AF',
    accent_color: branding?.accent_color || '#F59E0B'
  });
  const [saving, setSaving] = useState(false);
  const [copiedColor, setCopiedColor] = useState(null);

  const colorPresets = [
    { name: 'Professional Blue', primary: '#3B82F6', secondary: '#1E40AF', accent: '#F59E0B' },
    { name: 'Corporate Gray', primary: '#6B7280', secondary: '#374151', accent: '#EF4444' },
    { name: 'Modern Green', primary: '#10B981', secondary: '#059669', accent: '#F59E0B' },
    { name: 'Creative Purple', primary: '#8B5CF6', secondary: '#7C3AED', accent: '#F59E0B' },
    { name: 'Bold Orange', primary: '#F97316', secondary: '#EA580C', accent: '#3B82F6' },
    { name: 'Elegant Dark', primary: '#1F2937', secondary: '#111827', accent: '#EF4444' },
    { name: 'Construction Orange', primary: '#EA580C', secondary: '#C2410C', accent: '#059669' },
    { name: 'Industrial Blue', primary: '#0EA5E9', secondary: '#0284C7', accent: '#F59E0B' }
  ];

  const handleColorChange = (colorType, value) => {
    setColors(prev => ({ ...prev, [colorType]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      onError?.(null);
      
      const updatedBranding = await brandingService?.updateCompanyBranding(user?.id, colors);
      onUpdate?.(updatedBranding);
      showSuccessToast('Color palette updated successfully!');
    } catch (err) {
      showErrorToast('Failed to update color palette', err);
      onError?.('Failed to update color palette');
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset) => {
    setColors({
      primary_color: preset?.primary,
      secondary_color: preset?.secondary,
      accent_color: preset?.accent
    });
    showSuccessToast(`Applied ${preset.name} preset`);
  };

  const copyColor = async (color) => {
    try {
      await navigator.clipboard?.writeText(color);
      setCopiedColor(color);
      showSuccessToast(`Copied ${color} to clipboard`);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      showErrorToast('Failed to copy color to clipboard');
    }
  };

  const generateRandomColors = () => {
    const generateColor = () => {
      return '#' + Math.floor(Math.random()*16777215)?.toString(16)?.padStart(6, '0');
    };
    
    setColors({
      primary_color: generateColor(),
      secondary_color: generateColor(),
      accent_color: generateColor()
    });
    showSuccessToast('Generated random color palette');
  };

  const hasChanges = 
    colors?.primary_color !== branding?.primary_color ||
    colors?.secondary_color !== branding?.secondary_color ||
    colors?.accent_color !== branding?.accent_color;

  return (
    <div className="space-y-6">
      {/* Current Colors */}
      <Card className="p-6 bg-card border border-border construction-shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-construction/10 rounded-xl flex items-center justify-center">
              <Icon name="Palette" size={24} className="text-construction" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Color Palette Editor</h2>
              <p className="text-muted-foreground">Customize your brand colors for documents and templates</p>
            </div>
          </div>
          <Button onClick={generateRandomColors} variant="outline" iconName="RefreshCw" iconPosition="left">
            Random Colors
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { key: 'primary_color', label: 'Primary Color', description: 'Main brand color for headers and buttons' },
            { key: 'secondary_color', label: 'Secondary Color', description: 'Supporting color for backgrounds' },
            { key: 'accent_color', label: 'Accent Color', description: 'Highlight color for important elements' }
          ]?.map(({ key, label, description }) => (
            <div key={key} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  {label}
                </label>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={colors?.[key]}
                    onChange={(e) => handleColorChange(key, e?.target?.value)}
                    className="w-12 h-10 rounded-md border border-border cursor-pointer construction-shadow-sm"
                  />
                  <div className="flex-1">
                    <Input
                      value={colors?.[key]}
                      onChange={(e) => handleColorChange(key, e?.target?.value)}
                      placeholder="#000000"
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyColor(colors?.[key])}
                    iconName={copiedColor === colors?.[key] ? "Check" : "Copy"}
                    className={copiedColor === colors?.[key] ? "text-success border-success/50" : ""}
                  />
                </div>
                
                <div 
                  className="w-full h-20 rounded-xl border border-border construction-card-3d construction-depth-3 flex items-center justify-center text-white font-semibold text-sm transition-all duration-200"
                  style={{ backgroundColor: colors?.[key] }}
                >
                  {colors?.[key]}
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">You have unsaved changes</p>
                <p className="text-xs text-muted-foreground">Save your color palette to apply changes</p>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                iconName={saving ? "Loader2" : "Save"}
                iconPosition="left"
                className={saving ? "animate-spin" : ""}
              >
                {saving ? 'Saving...' : 'Save Color Palette'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Color Presets */}
      <Card className="p-6 bg-card border border-border construction-shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon name="Layers" size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Color Presets</h3>
            <p className="text-muted-foreground">Choose from professionally curated color combinations</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {colorPresets?.map((preset, index) => (
            <div key={index} className="group border border-border rounded-xl p-4 hover:construction-shadow-md transition-all duration-200 cursor-pointer" onClick={() => applyPreset(preset)}>
              <div className="flex gap-2 mb-4">
                <div 
                  className="w-10 h-10 rounded-xl construction-card-3d construction-depth-3"
                  style={{ backgroundColor: preset?.primary }}
                />
                <div 
                  className="w-10 h-10 rounded-xl construction-card-3d construction-depth-3"
                  style={{ backgroundColor: preset?.secondary }}
                />
                <div 
                  className="w-10 h-10 rounded-xl construction-card-3d construction-depth-3"
                  style={{ backgroundColor: preset?.accent }}
                />
              </div>
              <h4 className="font-semibold text-foreground mb-2">{preset?.name}</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  applyPreset(preset);
                }}
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                Apply Preset
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Live Preview */}
      <Card className="p-6 bg-card border border-border construction-shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
            <Icon name="Eye" size={24} className="text-success" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Live Preview</h3>
            <p className="text-muted-foreground">See how your colors will look in real documents</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Company Header Preview */}
          <div 
            className="p-8 rounded-xl text-white construction-shadow-sm"
            style={{ backgroundColor: colors?.primary_color }}
          >
            <h2 className="text-3xl font-bold mb-2">{branding?.name || 'Your Company Name'}</h2>
            <p className="opacity-90 text-lg">Professional construction services and project management</p>
          </div>
          
          {/* Button Preview */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Button Styles:</p>
            <div className="flex flex-wrap gap-4">
              <button 
                className="px-6 py-3 rounded-xl text-white font-semibold construction-card-3d construction-depth-3 hover:construction-shadow-md transition-all"
                style={{ backgroundColor: colors?.primary_color }}
              >
                Primary Button
              </button>
              <button 
                className="px-6 py-3 rounded-xl text-white font-semibold construction-card-3d construction-depth-3 hover:construction-shadow-md transition-all"
                style={{ backgroundColor: colors?.secondary_color }}
              >
                Secondary Button
              </button>
              <button 
                className="px-6 py-3 rounded-xl text-white font-semibold construction-card-3d construction-depth-3 hover:construction-shadow-md transition-all"
                style={{ backgroundColor: colors?.accent_color }}
              >
                Accent Button
              </button>
            </div>
          </div>
          
          {/* Invoice Preview */}
          <div className="border border-border rounded-xl p-6 bg-background construction-shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: colors?.primary_color }}>
                  INVOICE #INV-2025-001
                </h3>
                <p className="text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-muted-foreground">Due: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
              </div>
              <div 
                className="px-4 py-2 rounded-xl text-sm font-bold text-white construction-card-3d construction-depth-3"
                style={{ backgroundColor: colors?.accent_color }}
              >
                PAID
              </div>
            </div>
            
            <div className="border-t border-border pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2" style={{ color: colors?.secondary_color }}>
                    Bill To:
                  </h4>
                  <div className="text-muted-foreground space-y-1">
                    <p>Sample Construction Client</p>
                    <p>123 Project Street</p>
                    <p>Construction City, CC 12345</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2" style={{ color: colors?.secondary_color }}>
                    Total Amount:
                  </h4>
                  <p className="text-3xl font-bold" style={{ color: colors?.accent_color }}>
                    $12,500.00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}