import { useState, useEffect } from 'react';

/**
 * Hook to access the browser's geolocation API.
 * Provides current location and related states.
 */
const useLocation = (options = {}) => {
  // Default location for Jaipur, Jagatpura
  const defaultLocation = {
    latitude: 26.7925, 
    longitude: 75.8496,
    accuracy: null,
    timestamp: Date.now(),
    isDefault: true
  };

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('unknown'); // 'unknown', 'granted', 'denied'

  // Function to get current position
  const getCurrentPosition = () => {
    // Check if geolocation is available in the browser
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported by your browser'));
      setPermissionStatus('unavailable');
      // Use default location when geolocation is unavailable
      setLocation(defaultLocation);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          isDefault: false
        });
        setLoading(false);
        setPermissionStatus('granted');
      },
      (err) => {
        setError(err);
        setLoading(false);
        setPermissionStatus(err.code === 1 ? 'denied' : 'error');
        // Use default location when permission is denied
        setLocation(defaultLocation);
      },
      {
        enableHighAccuracy: options.highAccuracy || true,
        timeout: options.timeout || 5000,
        maximumAge: options.maximumAge || 0,
      }
    );
  };

  // Hook to check permission and potentially get location on mount
  useEffect(() => {
    // Always attempt to get location on mount unless explicitly disabled
    const shouldAutoRequest = options.autoRequest !== false;
    
    if (shouldAutoRequest) {
      getCurrentPosition();
    }
    // Only run this effect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Return all relevant states
  return {
    location,
    loading,
    error,
    permissionStatus,
    getCurrentPosition,
    isDefaultLocation: location?.isDefault || false
  };
};

export default useLocation;
