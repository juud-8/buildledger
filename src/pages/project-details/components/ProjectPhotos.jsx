import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProjectPhotos = ({ project }) => {
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const phases = [
    { id: 'all', label: 'All Photos', count: project?.photos?.length },
    { id: 'before', label: 'Before', count: project?.photos?.filter(p => p?.phase === 'before')?.length },
    { id: 'during', label: 'During', count: project?.photos?.filter(p => p?.phase === 'during')?.length },
    { id: 'after', label: 'After', count: project?.photos?.filter(p => p?.phase === 'after')?.length },
  ];

  const filteredPhotos = selectedPhase === 'all' 
    ? project?.photos 
    : project?.photos?.filter(photo => photo?.phase === selectedPhase);

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

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'before':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'during':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'after':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Upload */}
      <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Project Photos</h3>
            <p className="text-sm text-muted-foreground">Document project progress with photos</p>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload">
              <Button
                variant="outline"
                iconName="Upload"
                iconPosition="left"
                loading={isUploading}
                className="cursor-pointer"
                asChild
              >
                <span>Upload Photos</span>
              </Button>
            </label>
            <Button
              variant="default"
              iconName="Camera"
              iconPosition="left"
            >
              Take Photo
            </Button>
          </div>
        </div>
      </div>
      {/* Phase Filter */}
      <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
        <div className="flex flex-wrap gap-2">
          {phases?.map((phase) => (
            <button
              key={phase?.id}
              onClick={() => setSelectedPhase(phase?.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium construction-transition ${
                selectedPhase === phase?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {phase?.label} ({phase?.count})
            </button>
          ))}
        </div>
      </div>
      {/* Photo Grid */}
      <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
        {filteredPhotos?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPhotos?.map((photo, index) => (
              <div
                key={index}
                className="group relative bg-background border border-border rounded-lg overflow-hidden construction-shadow-sm hover:construction-shadow-md construction-transition cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={photo?.url}
                    alt={photo?.title}
                    className="w-full h-full object-cover group-hover:scale-105 construction-transition"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 construction-transition flex items-center justify-center">
                  <Icon 
                    name="ZoomIn" 
                    size={24} 
                    color="white" 
                    className="opacity-0 group-hover:opacity-100 construction-transition"
                  />
                </div>

                {/* Photo Info */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground text-sm truncate">{photo?.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPhaseColor(photo?.phase)}`}>
                      {photo?.phase}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{photo?.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{photo?.date}</span>
                    <span>{photo?.uploadedBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Icon name="Camera" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Photos Yet</h3>
            <p className="text-muted-foreground mb-4">
              {selectedPhase === 'all' ?'Start documenting your project by uploading photos'
                : `No photos found for ${selectedPhase} phase`
              }
            </p>
            <Button
              variant="outline"
              iconName="Upload"
              iconPosition="left"
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              Upload First Photo
            </Button>
          </div>
        )}
      </div>
      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-full bg-card rounded-lg overflow-hidden construction-shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">{selectedPhoto?.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedPhoto?.date} • {selectedPhoto?.uploadedBy}</p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 hover:bg-muted rounded-lg construction-transition"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <div className="mb-4">
                <Image
                  src={selectedPhoto?.url}
                  alt={selectedPhoto?.title}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPhaseColor(selectedPhoto?.phase)}`}>
                    {selectedPhoto?.phase}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" iconName="Download">
                    Download
                  </Button>
                  <Button variant="outline" size="sm" iconName="Share">
                    Share
                  </Button>
                </div>
              </div>
              
              {selectedPhoto?.description && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{selectedPhoto?.description}</p>
                </div>
              )}

              {selectedPhoto?.annotations && selectedPhoto?.annotations?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-foreground mb-2">Annotations</h4>
                  <div className="space-y-2">
                    {selectedPhoto?.annotations?.map((annotation, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <Icon name="MessageCircle" size={14} className="text-primary mt-0.5" />
                        <div>
                          <p className="text-foreground">{annotation?.text}</p>
                          <p className="text-xs text-muted-foreground">{annotation?.author} • {annotation?.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPhotos;