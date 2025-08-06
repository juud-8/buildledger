import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { showErrorToast, showInfoToast } from '../../utils/toastHelper';

const BarcodeScanner = ({ 
  isOpen, 
  onClose, 
  onBarcodeDetected,
  onItemNotFound 
}) => {
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [codeReader, setCodeReader] = useState(null);
  const [error, setError] = useState(null);

  // Initialize ZXing code reader
  useEffect(() => {
    if (isOpen) {
      const reader = new BrowserMultiFormatReader();
      setCodeReader(reader);
      
      return () => {
        if (reader) {
          reader.reset();
        }
      };
    }
  }, [isOpen]);

  // Get available cameras
  useEffect(() => {
    if (isOpen && codeReader) {
      initializeCamera();
    }
  }, [isOpen, codeReader]);

  const initializeCamera = async () => {
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      // Get video devices
      const videoDevices = await codeReader.listVideoInputDevices();
      
      if (videoDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      setDevices(videoDevices);
      
      // Prefer back camera on mobile devices
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      
      const defaultDevice = backCamera || videoDevices[0];
      setSelectedDeviceId(defaultDevice.deviceId);
      setHasPermission(true);

    } catch (err) {
      console.error('Camera initialization error:', err);
      setError(err.message);
      setHasPermission(false);
      showErrorToast('Camera access denied or not available');
    }
  };

  const startScanning = async () => {
    if (!codeReader || !selectedDeviceId) {
      showErrorToast('Camera not ready');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);

      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const scannedCode = result.getText();
            console.log('Barcode detected:', scannedCode);
            
            // Stop scanning
            stopScanning();
            
            // Notify parent component
            onBarcodeDetected(scannedCode);
            
            // Show success feedback
            showInfoToast(`Scanned: ${scannedCode}`);
          }
          
          if (err && !(err.name === 'NotFoundException')) {
            console.warn('Scanning error:', err);
          }
        }
      );

    } catch (err) {
      console.error('Start scanning error:', err);
      setError(err.message);
      showErrorToast('Failed to start camera');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  const switchCamera = (deviceId) => {
    if (isScanning) {
      stopScanning();
    }
    setSelectedDeviceId(deviceId);
  };

  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (!isOpen) return null;

  // Desktop fallback
  if (!isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4">
          <div className="text-center">
            <Icon name="Smartphone" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Mobile Device Required
            </h3>
            <p className="text-muted-foreground mb-4">
              Barcode scanning is only available on mobile devices with cameras.
            </p>
            <Button onClick={handleClose} className="w-full">
              Got it
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Scan Barcode</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <Icon name="X" size={24} />
          </Button>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full">
        {hasPermission === false || error ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center text-white">
              <Icon name="CameraOff" size={48} className="mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
              <p className="text-sm opacity-75 mb-4">
                {error || 'Please allow camera access to scan barcodes'}
              </p>
              <Button
                onClick={initializeCamera}
                className="mb-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scan Frame */}
                <div className="w-64 h-64 border-2 border-white relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
                  
                  {/* Scanning Line Animation */}
                  {isScanning && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse"></div>
                  )}
                </div>
                
                <p className="text-white text-center mt-4">
                  {isScanning ? 'Scanning...' : 'Position barcode in the frame'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Camera Controls */}
          {hasPermission && !error && (
            <>
              {/* Start/Stop Scanning Button */}
              <Button
                onClick={isScanning ? stopScanning : startScanning}
                size="lg"
                className={`w-16 h-16 rounded-full ${
                  isScanning 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                <Icon 
                  name={isScanning ? "Square" : "Camera"} 
                  size={24} 
                  className="text-white"
                />
              </Button>

              {/* Camera Selector */}
              {devices.length > 1 && (
                <div className="flex space-x-2">
                  {devices.map((device, index) => (
                    <Button
                      key={device.deviceId}
                      onClick={() => switchCamera(device.deviceId)}
                      variant={selectedDeviceId === device.deviceId ? "default" : "ghost"}
                      size="sm"
                      className="text-white"
                    >
                      {device.label || `Camera ${index + 1}`}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Instructions */}
          <div className="text-center">
            <p className="text-white text-sm opacity-75">
              Hold your device steady and point the camera at a barcode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;