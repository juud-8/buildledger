// Mobile utility functions for PDF handling

// Check if device is mobile
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if device is iOS
export const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Handle mobile PDF download with better user experience
export const handleMobilePDFDownload = (blob, filename, showToast) => {
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  
  if (isMobileDevice()) {
    // For mobile devices, especially iOS, we need special handling
    if (isIOSDevice()) {
      // iOS Safari doesn't support direct PDF downloads well
      // Open in new window/tab for better user experience
      const newWindow = window.open(url, '_blank');
      
      if (newWindow) {
        // Give the user instructions via toast
        showToast && showToast('PDF opened in new tab. Use Share > Save to Files to download.', 'ℹ️');
      } else {
        // Fallback if popup blocked
        window.location.href = url;
      }
    } else {
      // Android and other mobile browsers
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.setAttribute('target', '_blank'); // Open in new tab as backup
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } else {
    // Desktop browsers - standard download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Clean up the blob URL after a delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

// Get appropriate file extension based on device capabilities
export const getOptimalFileFormat = () => {
  // PDF is universally supported, but we could extend this
  // to support other formats in the future if needed
  return 'pdf';
};

// Check if device supports native PDF viewing
export const supportsNativePDFViewing = () => {
  // Most modern browsers support PDF viewing
  // This could be enhanced to check for specific capabilities
  return true;
};

// Generate mobile-friendly filename
export const generateMobileFilename = (baseFilename, documentType, documentNumber) => {
  // Remove spaces and special characters for better mobile compatibility
  const cleanBaseFilename = baseFilename.replace(/[^a-zA-Z0-9-_]/g, '-');
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
  return `${documentType}-${documentNumber || timestamp}-${cleanBaseFilename}.pdf`;
};

// Show mobile-appropriate loading indicator
export const showMobileLoadingState = (isLoading, message = 'Generating PDF...') => {
  if (isMobileDevice()) {
    // On mobile, we might want to show a more prominent loading state
    // since PDF generation can be slower on mobile devices
    return {
      showFullScreenLoader: true,
      message: `${message}\nThis may take a moment on mobile devices.`
    };
  }
  
  return {
    showFullScreenLoader: false,
    message
  };
};

// Handle PDF viewing preferences on mobile
export const getMobilePDFViewingOptions = () => {
  return {
    // Whether to open PDF in new tab/window
    openInNewTab: isMobileDevice(),
    // Whether to show download instructions
    showInstructions: isIOSDevice(),
    // Whether to use blob URL or data URL
    useBlobURL: !isIOSDevice(), // iOS sometimes has issues with blob URLs
  };
};