import React, { useState, useEffect } from 'react';
import { brandingService } from '../../../services/brandingService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Book, Plus, Edit, Trash2, Shield } from 'lucide-react';

export function BrandGuidelines({ branding, userId, onError }) {
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState(null);
  const [formData, setFormData] = useState({
    guideline_type: 'color_palette',
    title: '',
    description: '',
    settings: {},
    is_enforced: false
  });

  const guidelineTypeOptions = [
    { value: 'color_palette', label: 'Color Palette' },
    { value: 'typography', label: 'Typography' },
    { value: 'logo_usage', label: 'Logo Usage' },
    { value: 'spacing', label: 'Spacing Guidelines' },
    { value: 'imagery', label: 'Imagery Standards' },
    { value: 'tone_voice', label: 'Tone of Voice' }
  ];

  useEffect(() => {
    if (userId) {
      loadGuidelines();
    }
  }, [userId]);

  const loadGuidelines = async () => {
    try {
      setLoading(true);
      onError?.(null);
      const data = await brandingService?.getBrandGuidelines(userId);
      setGuidelines(data || []);
    } catch (err) {
      onError?.('Failed to load brand guidelines');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGuideline = async () => {
    try {
      onError?.(null);
      const guidelineData = {
        ...formData,
        user_id: userId,
        branding_id: branding?.id
      };
      
      const newGuideline = await brandingService?.createBrandGuideline(guidelineData);
      setGuidelines(prev => [newGuideline, ...prev]);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      onError?.('Failed to create brand guideline');
    }
  };

  const handleUpdateGuideline = async () => {
    try {
      onError?.(null);
      const updatedGuideline = await brandingService?.updateBrandGuideline(
        editingGuideline?.id, 
        formData
      );
      setGuidelines(prev => prev?.map(g => g?.id === editingGuideline?.id ? updatedGuideline : g));
      setEditingGuideline(null);
      resetForm();
    } catch (err) {
      onError?.('Failed to update brand guideline');
    }
  };

  const handleDeleteGuideline = async (guidelineId) => {
    if (!confirm('Are you sure you want to delete this guideline?')) return;
    
    try {
      onError?.(null);
      await brandingService?.deleteBrandGuideline(guidelineId);
      setGuidelines(prev => prev?.filter(g => g?.id !== guidelineId));
    } catch (err) {
      onError?.('Failed to delete brand guideline');
    }
  };

  const resetForm = () => {
    setFormData({
      guideline_type: 'color_palette',
      title: '',
      description: '',
      settings: {},
      is_enforced: false
    });
  };

  const openEditModal = (guideline) => {
    setEditingGuideline(guideline);
    setFormData({
      guideline_type: guideline?.guideline_type,
      title: guideline?.title,
      description: guideline?.description || '',
      settings: guideline?.settings || {},
      is_enforced: guideline?.is_enforced
    });
  };

  const getGuidelineIcon = (type) => {
    const icons = {
      color_palette: '🎨',
      typography: '📝',
      logo_usage: '🏢',
      spacing: '📐',
      imagery: '🖼️',
      tone_voice: '🗣️'
    };
    return icons?.[type] || '📋';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Loading guidelines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Book className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Brand Guidelines</h2>
              <p className="text-gray-600">Define and enforce your brand standards</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Guideline
          </Button>
        </div>
      </div>
      {/* Guidelines List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {guidelines?.length === 0 ? (
          <div className="p-12 text-center">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No guidelines created</h3>
            <p className="text-gray-600 mb-4">Create brand guidelines to maintain consistency across all materials.</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Guideline
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {guidelines?.map((guideline) => (
              <div key={guideline?.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getGuidelineIcon(guideline?.guideline_type)}</span>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {guideline?.title}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {guideline?.guideline_type?.replace('_', ' ')}
                        </p>
                      </div>
                      {guideline?.is_enforced && (
                        <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <Shield className="w-4 h-4 mr-1" />
                          <span className="text-xs font-medium">Enforced</span>
                        </div>
                      )}
                    </div>
                    
                    {guideline?.description && (
                      <p className="text-gray-700 mb-3">{guideline?.description}</p>
                    )}
                    
                    {/* Display settings based on type */}
                    {guideline?.guideline_type === 'color_palette' && guideline?.settings?.primary && (
                      <div className="flex gap-2 mb-3">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: guideline?.settings?.primary }}
                          title={`Primary: ${guideline?.settings?.primary}`}
                        ></div>
                        {guideline?.settings?.secondary && (
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: guideline?.settings?.secondary }}
                            title={`Secondary: ${guideline?.settings?.secondary}`}
                          ></div>
                        )}
                      </div>
                    )}
                    
                    {guideline?.guideline_type === 'typography' && guideline?.settings?.font_family && (
                      <p 
                        className="text-sm text-gray-700 mb-3"
                        style={{ fontFamily: guideline?.settings?.font_family }}
                      >
                        Font: {guideline?.settings?.font_family} 
                        {guideline?.settings?.heading_size && ` | Heading: ${guideline?.settings?.heading_size}`}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Created {new Date(guideline.created_at)?.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openEditModal(guideline)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteGuideline(guideline?.id)}
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
      {/* Create/Edit Modal */}
      {(showCreateModal || editingGuideline) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingGuideline ? 'Edit Guideline' : 'Create New Guideline'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guideline Type
                  </label>
                  <Select
                    value={formData?.guideline_type}
                    onValueChange={(value) => setFormData({ ...formData, guideline_type: value })}
                    options={guidelineTypeOptions}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <Input
                    value={formData?.title}
                    onChange={(e) => setFormData({ ...formData, title: e?.target?.value })}
                    placeholder="Enter guideline title"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData?.description}
                  onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
                  placeholder="Describe this guideline..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <Checkbox
                  checked={formData?.is_enforced}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_enforced: checked })}
                />
                <label className="ml-2 text-sm text-gray-700">
                  Enforce this guideline (automatically apply to new documents)
                </label>
              </div>

              {/* Type-specific settings */}
              {formData?.guideline_type === 'color_palette' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Color Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Primary Color</label>
                      <input
                        type="color"
                        value={formData?.settings?.primary || branding?.primary_color || '#3B82F6'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData?.settings, primary: e?.target?.value }
                        })}
                        className="w-full h-10 rounded border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Secondary Color</label>
                      <input
                        type="color"
                        value={formData?.settings?.secondary || branding?.secondary_color || '#1E40AF'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData?.settings, secondary: e?.target?.value }
                        })}
                        className="w-full h-10 rounded border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData?.guideline_type === 'typography' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Typography Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Font Family</label>
                      <Input
                        value={formData?.settings?.font_family || branding?.font_family || 'Inter'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData?.settings, font_family: e?.target?.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Heading Size</label>
                      <Input
                        value={formData?.settings?.heading_size || '24px'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData?.settings, heading_size: e?.target?.value }
                        })}
                        placeholder="24px"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t flex gap-3">
              <Button 
                onClick={editingGuideline ? handleUpdateGuideline : handleCreateGuideline}
                disabled={!formData?.title}
              >
                {editingGuideline ? 'Update Guideline' : 'Create Guideline'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingGuideline(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}