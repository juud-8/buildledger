import toast from 'react-hot-toast';

// Check if in development mode
const isDev = import.meta.env.DEV;

// Helper function to log with timestamp in dev mode
const devLog = (action, data) => {
  if (isDev) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${action}:`, data);
  }
};

// Toast configuration
const toastConfig = {
  position: 'top-right',
  duration: 4000,
  style: {
    background: '#1f2937',
    color: '#fff',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
  },
};

// Success toast with logging
export const showSuccessToast = (message, data = null) => {
  devLog(`SUCCESS: ${message}`, data);
  return toast.success(message, toastConfig);
};

// Error toast with logging
export const showErrorToast = (message, error = null) => {
  devLog(`ERROR: ${message}`, error);
  
  // Extract meaningful error message
  let errorMessage = message;
  if (error) {
    if (error.message) {
      errorMessage = `${message}: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage = `${message}: ${error}`;
    }
  }
  
  return toast.error(errorMessage, {
    ...toastConfig,
    duration: 6000, // Longer duration for errors
  });
};

// Info toast with logging
export const showInfoToast = (message, data = null) => {
  devLog(`INFO: ${message}`, data);
  return toast(message, {
    ...toastConfig,
    icon: 'ℹ️',
  });
};

// Loading toast with logging
export const showLoadingToast = (message) => {
  devLog(`LOADING: ${message}`, null);
  return toast.loading(message, toastConfig);
};

// Promise toast handler for async operations
export const toastPromise = (promise, messages) => {
  const { loading, success, error } = messages;
  
  devLog(`PROMISE_START: ${loading}`, null);
  
  return toast.promise(
    promise,
    {
      loading: loading,
      success: (data) => {
        devLog(`PROMISE_SUCCESS: ${success}`, data);
        return success;
      },
      error: (err) => {
        devLog(`PROMISE_ERROR: ${error}`, err);
        const errorMessage = err?.message || err || 'An error occurred';
        return `${error}: ${errorMessage}`;
      },
    },
    toastConfig
  );
};

// Dismiss a specific toast
export const dismissToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  }
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
}; 