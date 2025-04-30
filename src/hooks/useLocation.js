import { useState, useEffect } from 'react';

const useLocation = ({ autoRequest = false } = {}) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [isDefaultLocation, setIsDefaultLocation] = useState(true);

  // Default location (Jaipur, Jagatpura)
  const defaultLocation = {
    latitude: 26.8535,
    longitude: 75.8655
  };

  const checkPermission = async () => {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(status.state);
      
      if (status.state === 'granted') {
        getCurrentPosition();
      } else {
        setLocation(defaultLocation);
        setIsDefaultLocation(true);
      }

      status.addEventListener('change', () => {
        setPermissionStatus(status.state);
        if (status.state === 'granted') {
          getCurrentPosition();
        }
      });
    } catch (err) {
      console.error('Permission check failed:', err);
      setLocation(defaultLocation);
      setIsDefaultLocation(true);
    }
  };

  const getCurrentPosition = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      setLocation(defaultLocation);
      setIsDefaultLocation(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsDefaultLocation(false);
        setLoading(false);
      },
      (error) => {
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable it in your browser settings.';
            setPermissionStatus('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        setError(errorMessage);
        setLocation(defaultLocation);
        setIsDefaultLocation(true);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    checkPermission();
    return () => {
      navigator.permissions.query({ name: 'geolocation' }).then(status => {
        status.removeEventListener('change', () => {});
      }).catch(() => {});
    };
  }, []);

  return { 
    location, 
    loading, 
    error, 
    getCurrentPosition, 
    permissionStatus,
    isDefaultLocation 
  };
};

export default useLocation;
