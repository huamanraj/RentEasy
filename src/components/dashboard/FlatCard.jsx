import React from 'react';
import { fileStorage } from '../../utils/appwrite';

const FlatCard = ({ flat, onEdit, onStatusChange, onDelete }) => {
  const flatId = flat.$id || flat.id;
  
  // Helper to get image URL
  const getImageUrl = () => {
    // Check for various image field patterns
    if (flat.images && flat.images.length > 0) {
      try {
        return fileStorage.getImageUrl(flat.images[0]);
      } catch (err) {
        console.error("Error getting image:", err);
      }
    } else if (flat.image) {
      return flat.image; // Direct URL
    }
    return 'https://via.placeholder.com/150?text=No+Image'; // Default
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
      <div className="h-48 md:h-auto md:w-1/3 relative">
        <img 
          src={getImageUrl()}
          alt={flat.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            e.target.onerror = null;
          }}
        />
      </div>
      
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{flat.title}</h3>
          <div className="mt-1 flex flex-wrap gap-2 mb-2">
            <span className={`text-sm px-2 py-0.5 rounded-full ${!flat.isAvailable ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {flat.isAvailable ? 'Available' : 'Booked'}
            </span>
            <span className="text-sm px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{flat.type}</span>
            <span className="text-sm px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full">
              ₹{flat.rent || flat.price || 'Price not set'}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 line-clamp-2">
            {flat.address || 'No address provided'}
          </div>
          
          {(flat.createdAt || flat.$createdAt) && (
            <div className="mt-2 text-xs text-gray-500">
              Posted: {formatDate(flat.createdAt || flat.$createdAt)}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <button 
            onClick={() => onEdit(flatId)} 
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          >
            Edit
          </button>
          
          {flat.isAvailable ? (
            <button 
              onClick={() => onStatusChange(flatId, false)}
              className="px-3 py-1 text-sm bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 transition-colors"
            >
              Mark as Booked
            </button>
          ) : (
            <button 
              onClick={() => onStatusChange(flatId, true)}
              className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
            >
              Mark as Available
            </button>
          )}
          
          <button 
            onClick={() => onDelete(flatId)}
            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlatCard;
