import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FlatForm from '../components/FlatForm';
import { flatsDb, fileStorage } from '../utils/appwrite';
import { useAuth } from '../context/AuthContext';

const PostFlat = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the current user

  // Handle form submission to Appwrite
  const handlePostSubmit = async (formData, progressCallback) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!user || !user.$id) {
        throw new Error("You must be logged in to post a flat");
      }
      
      const userId = user.$id;

      // 1. Upload images to storage bucket - pass userId for permissions
      const imageUrls = []; // Array to store only the image URLs
      
      for (const imageFile of formData.images) {
        try {
          const imageData = await fileStorage.uploadImage(imageFile, progressCallback, userId);
          
          // Store only the file ID, not the full URL to avoid character limit issues
          // Appwrite can reconstruct the URL from the ID when needed
          imageUrls.push(imageData.id);
        } catch (imgError) {
          console.error(`Error uploading image ${imageFile.name}:`, imgError);
          // Continue with the rest of the images
        }
      }
      
      // 2. Upload video if provided - pass userId for permissions
      let videoId = null;
      if (formData.video) {
        try {
          const videoData = await fileStorage.uploadVideo(formData.video, progressCallback, userId);
          videoId = videoData.id; // Store just the ID
        } catch (videoError) {
          console.error('Error uploading video:', videoError);
          // Continue without the video
        }
      }
      
      // 3. Prepare data for database
      const flatData = {
        title: formData.title,
        rent: parseFloat(formData.rent),
        address: formData.address,
        type: formData.type,
        description: formData.description,
        amenities: formData.amenities,
        googleMapLink: formData.googleMapLink,
        userId: userId,
        userName: user.name || user.email || 'Anonymous User',
        latitude: formData.location?.latitude || null,
        longitude: formData.location?.longitude || null,
        // Store only the file IDs as strings in the images array
        images: imageUrls,
        // Store only the video ID as a string
        video: videoId,
        isAvailable: formData.isAvailable || true,
        // Convert ownerNumber from string to integer
        ownerNumber: formData.ownerNumber
      };
      
      // 4. Save flat data to database
      const createdFlat = await flatsDb.createFlat(flatData);
      
      // 5. Success - redirect to the newly created flat page
      console.log("Successfully created flat:", createdFlat);
      navigate(`/flat/${createdFlat.$id}`); 
      
    } catch (err) {
      console.error("Error posting flat:", err);
      setError(err.message || "Failed to post your flat. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}
      <FlatForm 
        onSubmit={handlePostSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
};

export default PostFlat;
