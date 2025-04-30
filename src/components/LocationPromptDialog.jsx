import { motion } from 'framer-motion';

const LocationPromptDialog = ({ 
  isOpen, 
  onClose, 
  onTryAgain, 
  isDefaultLocation, 
  locationLoading,
  permissionStatus 
}) => {
  if (!isOpen || permissionStatus === 'granted') return null;

  const handleAllowClick = () => {
    if (permissionStatus !== 'granted') {
      onTryAgain();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative z-50"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-textDark">
              {isDefaultLocation ? 'Using Jaipur as your location' : 'Allow location access?'}
            </h3>
            <p className="text-sm text-textLight mt-2">
              {isDefaultLocation 
                ? "We're currently showing properties based on a default location. Allow location access to see rental properties near your actual location."
                : 'To show you rental properties near you, we need your location. This helps us calculate distances and show relevant results.'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <div className="mt-6 flex space-x-3">
          
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-textDark rounded-md hover:bg-gray-300 transition duration-200"
          >
            {isDefaultLocation ? 'Continue with Default' : 'Not Now'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LocationPromptDialog;
