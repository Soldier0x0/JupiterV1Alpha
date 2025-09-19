// Utility functions for handling click events consistently

export const handleClickWithErrorBoundary = (callback, errorMessage = 'Click action failed') => {
  return (event) => {
    try {
      event.preventDefault();
      event.stopPropagation();
      callback(event);
    } catch (error) {
      console.error('Click handler error:', error);
      alert(errorMessage);
    }
  };
};

export const handleAsyncClick = async (callback, errorMessage = 'Action failed') => {
  return async (event) => {
    try {
      event.preventDefault();
      event.stopPropagation();
      await callback(event);
    } catch (error) {
      console.error('Async click handler error:', error);
      alert(errorMessage);
    }
  };
};

export const debounceClick = (callback, delay = 300) => {
  let timeoutId;
  return (event) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(event);
    }, delay);
  };
};

export const throttleClick = (callback, delay = 1000) => {
  let lastCall = 0;
  return (event) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(event);
    }
  };
};

// Navigation helper
export const navigateWithErrorHandling = (navigate, path, errorMessage = 'Navigation failed') => {
  return () => {
    try {
      console.log('Navigating to:', path);
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
      alert(errorMessage);
    }
  };
};

// API call helper
export const handleApiCall = async (apiCall, successMessage, errorMessage) => {
  try {
    const result = await apiCall();
    if (successMessage) {
      alert(successMessage);
    }
    return result;
  } catch (error) {
    console.error('API call error:', error);
    alert(errorMessage || 'Operation failed');
    throw error;
  }
};
