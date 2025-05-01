import React from 'react';
import PropTypes from 'prop-types';
import { Wifi, Car, MapPin, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FlatDetails = ({ flat }) => {
  if (!flat) {
    return <div>Loading flat details...</div>;
  }

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

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi size={16} />;
    if (amenityLower.includes('parking')) return <Car size={16} />;
    return <span className="text-green-500">✓</span>;
  };
  
  const getGoogleMapsUrl = () => {
    if (!googleMapLink) {
      if (latitude && longitude) {
        return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sin!4v1`;
      }
      return null;
    }

    // If it's already an embed URL, return as is
    if (googleMapLink.includes('/embed')) {
      return googleMapLink;
    }

    // Convert share URL to embed URL
    let embedUrl = googleMapLink;
    
    // Handle full Google Maps URLs
    if (googleMapLink.includes('google.com/maps')) {
      embedUrl = googleMapLink
        .replace('google.com/maps?', 'google.com/maps/embed?')
        .replace('google.com/maps/place/', 'google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!')
        .replace('@', '');
    }

    // Handle short URLs
    if (googleMapLink.includes('goo.gl/maps')) {
      embedUrl = `https://www.google.com/maps/embed?pb=${googleMapLink.split('/').pop()}`;
    }

    return embedUrl;
  };

  const mapsUrl = getGoogleMapsUrl();

  const handleCallOwner = () => {
    if (ownerNumber) {
      window.location.href = `tel:${ownerNumber}`;
    } else {
      toast.error('Contact number not available');
    }
  };

  const formatPhoneNumber = (number) => {
    if (!number) return '';
    const numStr = String(number);
    if (numStr.length === 10) {
      return `${numStr.slice(0, 3)} ${numStr.slice(3, 6)} ${numStr.slice(6)}`;
    }
    return numStr;
  };

  return (
    <div className="space-y-8">
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

      <div>
        <h2 className="text-2xl font-semibold text-textDark mb-3">Description</h2>
        <p className="text-textLight leading-relaxed">
          {description || 'No description available.'}
        </p>
      </div>

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

      <div>
        <h2 className="text-2xl font-semibold text-textDark mb-3">Location</h2>
        <div className="space-y-3">
          {mapsUrl && (
            <a
              href={googleMapLink || mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Open in Google Maps
            </a>
          )}
          
          {mapsUrl ? (
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <iframe 
                src={mapsUrl}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
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
      </div>
    </div>
  );
};

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
    ownerNumber: PropTypes.string,
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
