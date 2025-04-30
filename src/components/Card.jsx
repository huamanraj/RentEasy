import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { storage } from '../services/appwrite';
import { STORAGE } from '../services/appwrite';

const Card = ({ listing }) => {
  if (!listing) return null;

  // Extract ID from Appwrite ($id) or use regular id property
  const id = listing.$id || listing.id;
  
  // Get image URL from various possible sources
  const getImageUrl = () => {
    // If we have an image URL directly, use it
    if (listing.image) return listing.image;
    
    // If we have Appwrite image file IDs in an array
    if (Array.isArray(listing.images) && listing.images.length > 0) {
      const firstImage = listing.images[0];
      
      // If the image is already a full URL, return it
      if (typeof firstImage === 'string' && firstImage.startsWith('http')) {
        return firstImage;
      }
      
      // If it's a file ID and we have the storage bucket ID, generate a view URL
      if (typeof firstImage === 'string' && STORAGE?.IMAGES) {
        return storage.getFileView(STORAGE.IMAGES, firstImage);
      }
    }
    
    // Default image as fallback
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60';
  };

  // Handle location which could be either a string or an object with lat/lng
  const locationDisplay = typeof listing.location === 'object' 
    ? (listing.location.address || 'View on map') 
    : (listing.location || listing.address || 'Unknown Location');

  const imageUrl = getImageUrl();

  return (
    <motion.div
      className="bg-transparent rounded-xl cursor-pointer h-full flex flex-col"
    >
      <Link to={`/flat/${id}`} className="flex flex-col h-full">
        <div className="flex-shrink-0"> {/* Image container */}
            <img
              src={imageUrl}
              alt={listing.title || 'Listing Image'}
              className="w-full h-48 object-cover rounded-[18px]"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60';
              }}
            />
        </div>
        <div className="py-3 flex-grow flex flex-col justify-between bg-transparent">
            <div>
                <h3 className="text-lg text-textDark truncate mb-1 bg-transparent">
                    Rent ₹{(listing.rent || listing.price)?.toLocaleString('en-IN') || 'N/A'} - {listing.type || 'N/A'}
                </h3>
                <p className="text-sm text-textLight flex items-center mt-1 truncate bg-transparent">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    {locationDisplay}
                </p>
            </div>
             {listing.distance && (
               <p className="text-xs text-gray-500 mt-1 bg-transparent">
                 {listing.distance.toFixed(1)} km away
               </p>
             )}
        </div>
      </Link>
    </motion.div>
  );
};

Card.propTypes = {
  listing: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    $id: PropTypes.string, // Appwrite document ID
    image: PropTypes.string, // URL string
    title: PropTypes.string,
    price: PropTypes.number,
    type: PropTypes.string,
    location: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        address: PropTypes.string
      })
    ]),
    distance: PropTypes.number // Optional distance property
  }).isRequired,
};

export default Card;
