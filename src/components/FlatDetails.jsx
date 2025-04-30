import React from 'react';
import PropTypes from 'prop-types';
import { Wifi, Car, MapPin, Phone } from 'lucide-react'; // Added Phone icon

const FlatDetails = ({ flat }) => {
  if (!flat) {
    return <div>Loading flat details...</div>;
  }

  // Console log for debugging
  console.log("FlatDetails received flat data:", { 
    hasOwnerNumber: Boolean(flat.ownerNumber),
    ownerNumber: flat.ownerNumber,
    flatKeys: Object.keys(flat)
  });

  // Handle both formats of images (array of strings or array of objects)
  const getImageUrls = (images) => {
    if (!images) return [];
    
    // Check if the images are objects with urls or direct strings
    if (typeof images[0] === 'object' && images[0]?.url) {
      return images.map(img => img.url);
    }
    return images; // Already array of strings
  };

  // Extract data from flat object with fallbacks
  const { 
    title, 
    price,
    rent,
    address, 
    description, 
    amenities = [], 
    type, 
    latitude,
    longitude,
    googleMapLink,
    ownerNumber
  } = flat;

  // Get icon for amenity (simplified example)
  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi size={16} />;
    if (amenityLower.includes('parking')) return <Car size={16} />;
    return <span className="text-green-500">✓</span>;
  };
  
  // Generate Google Maps URL if latitude/longitude exist
  const getGoogleMapsUrl = () => {
    if (googleMapLink) return googleMapLink;
    if (latitude && longitude) {
      return `https://www.google.com/maps?q=${latitude},${longitude}`;
    }
    return null;
  };

  const mapsUrl = getGoogleMapsUrl();

  // Function to handle phone call
  const handleCallOwner = () => {
    if (ownerNumber) {
      window.location.href = `tel:${ownerNumber}`;
    } else {
      alert('Contact number not available');
    }
  };

  // Format phone number for display (add spaces for readability)
  const formatPhoneNumber = (number) => {
    if (!number) return '';
    const numStr = String(number);
    // For a 10-digit number: XXX XXX XXXX
    if (numStr.length === 10) {
      return `${numStr.slice(0, 3)} ${numStr.slice(3, 6)} ${numStr.slice(6)}`;
    }
    return numStr;
  };

  return (
    <div className="space-y-8">
      {/* Title and Basic Info */}
      <div>
        <h1 className="text-3xl font-bold text-textDark">{title || 'Flat Title'}</h1>
        <p className="text-lg text-textLight mt-1">{type || 'Property Type'}</p>
        <p className="text-xl font-semibold text-primary mt-2">₹{rent || price || 'N/A'} / month</p>
        <p className="text-md text-gray-600 mt-2">{address || 'Full Address Here'}</p>
        {(latitude && longitude) && (
          <p className="text-sm text-gray-500 mt-1">
            Coordinates: {latitude}, {longitude}
          </p>
        )}
      </div>

      {/* Call to Action Button - MOVED HERE */}
      <div className="pt-2">
        <button 
          onClick={handleCallOwner}
          className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-red-700 transition duration-200 flex items-center justify-center"
          disabled={!ownerNumber}
        >
          <Phone className="mr-2 h-5 w-5" />
          {ownerNumber ? `Call Owner: ${formatPhoneNumber(ownerNumber)}` : 'No Contact Available'}
        </button>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-2xl font-semibold text-textDark mb-3">Description</h2>
        <p className="text-textLight leading-relaxed">
          {description || 'No description available.'}
        </p>
      </div>

      {/* Amenities */}
      <div>
        <h2 className="text-2xl font-semibold text-textDark mb-4">Amenities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {amenities.length > 0 ? amenities.map((amenity, index) => (
            <div key={index} className="flex items-center space-x-2">
              {getAmenityIcon(amenity)}
              <span className="text-textLight">{amenity}</span>
            </div>
          )) : <p className="text-textLight">No specific amenities listed.</p>}
        </div>
      </div>

      {/* Google Map Embed */}
      <div>
        <h2 className="text-2xl font-semibold text-textDark mb-3">Location</h2>
        {mapsUrl ? (
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
            <iframe 
              src={`${mapsUrl.replace(/\bq=/, 'q=')}&output=embed`}
              className="w-full h-64 border-0"
              allowFullScreen="" 
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps location"
            ></iframe>
          </div>
        ) : (
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Map not available</p>
            </div>
          </div>
        )}
      </div>

      {/* Debug info - only shown in development */}
      {import.meta.env.DEV && !ownerNumber && (
        <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-lg">
          <p className="font-medium">Developer Note:</p>
          <p>Owner number is not available. Make sure:</p>
          <ol className="list-decimal ml-5 mt-1 text-xs">
            <li>The field is included in the database schema</li>
            <li>The field is being passed correctly from the backend</li>
            <li>You're using the latest API version</li>
          </ol>
          <p className="mt-1">Flat data keys: {Object.keys(flat).join(', ')}</p>
        </div>
      )}
    </div>
  );
};

// Update prop validation to include ownerNumber
FlatDetails.propTypes = {
  flat: PropTypes.shape({
    title: PropTypes.string,
    price: PropTypes.number,
    rent: PropTypes.number, 
    address: PropTypes.string,
    description: PropTypes.string,
    amenities: PropTypes.arrayOf(PropTypes.string),
    type: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    googleMapLink: PropTypes.string,
    ownerNumber: PropTypes.string, // Add owner number to prop types
    images: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        url: PropTypes.string,
        name: PropTypes.string
      }))
    ]),
    video: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.string,
        url: PropTypes.string,
        name: PropTypes.string
      })
    ])
  }),
};

export default FlatDetails;
