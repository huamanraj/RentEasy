import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import FlatForm from '../components/FlatForm';
import { flatsDb, fileStorage } from '../utils/appwrite';
import { useAuth } from '../context/AuthContext';

const PostFlat = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePostSubmit = async (formData, progressCallback) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!user || !user.$id) {
        throw new Error("You must be logged in to post a flat");
      }
      
      const userId = user.$id;

      const imageUrls = [];
      
      for (const imageFile of formData.images) {
        try {
          const imageData = await fileStorage.uploadImage(imageFile, progressCallback, userId);
          imageUrls.push(imageData.id);
        } catch (imgError) {
          console.error(`Error uploading image ${imageFile.name}:`, imgError);
        }
      }
      
      let videoId = null;
      if (formData.video) {
        try {
          const videoData = await fileStorage.uploadVideo(formData.video, progressCallback, userId);
          videoId = videoData.id;
        } catch (videoError) {
          console.error('Error uploading video:', videoError);
        }
      }
      
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
        images: imageUrls,
        video: videoId,
        isAvailable: formData.isAvailable || true,
        ownerNumber: formData.ownerNumber
      };
      
      const createdFlat = await flatsDb.createFlat(flatData);
      
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
