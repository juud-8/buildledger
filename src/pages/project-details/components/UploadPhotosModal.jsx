import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UploadPhotosModal = ({ isOpen, onClose, onUpload }) => {
  const [files, setFiles] = useState([]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = () => {
    if (files.length === 0) {
      alert('Please select files to upload.');
      return;
    }
    onUpload(files);
    console.log('Uploading files:', files);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md construction-shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Upload Photos</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg construction-transition"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Icon name="UploadCloud" size={48} className="mx-auto text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Drag & drop files here, or click to select files</p>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          {files.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {files.length} file(s) selected: {files.map(f => f.name).join(', ')}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleUpload}
            fullWidth
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadPhotosModal;
