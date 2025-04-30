import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import FlatForm from '../components/FlatForm';
import { flatsDb, fileStorage } from '../utils/appwrite';
import { useAuth } from '../context/AuthContext';
import { databases, DATABASES, COLLECTIONS } from '../services/appwrite';

const EditFlat = () => {
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [flatData, setFlatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFlatData = async () => {
      try {
        const data = await flatsDb.getFlat(id);
        
        if (data.userId !== user?.$id) {
          throw new Error("You don't have permission to edit this flat");
        }
        
        setFlatData(data);
      } catch (err) {
        console.error('Error fetching flat:', err);
        setError(err.message || 'Failed to load flat data');
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchFlatData();
    }
  }, [id, user]);

  const handleSubmit = async (formData, progressCallback) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!user || !user.$id) {
        throw new Error("You must be logged in to edit a flat");
      }
      
      const loadingToast = toast.loading('Updating your flat...');
      
      const userId = user.$id;

      const imageUrls = [...(flatData.images || [])];
      
      if (formData.images && formData.images.length > 0) {
        for (const imageFile of formData.images) {
          if (imageFile instanceof File) {
            try {
              const imageData = await fileStorage.uploadImage(imageFile, progressCallback, userId);
              imageUrls.push(imageData.id);
            } catch (imgError) {
              console.error(`Error uploading image ${imageFile.name}:`, imgError);
            }
          }
        }
      }
      
      let videoId = flatData.video || null;
      if (formData.video && formData.video instanceof File) {
        try {
          const videoData = await fileStorage.uploadVideo(formData.video, progressCallback, userId);
          videoId = videoData.id;
        } catch (videoError) {
          console.error('Error uploading video:', videoError);
        }
      }
      
      const updateData = {
        title: formData.title,
        rent: parseFloat(formData.rent),
        address: formData.address,
        type: formData.type,
        description: formData.description,
        amenities: formData.amenities || [],
        googleMapLink: formData.googleMapLink || '',
        latitude: formData.latitude || flatData.latitude,
        longitude: formData.longitude || flatData.longitude,
        images: imageUrls,
        video: videoId,
        isAvailable: formData.isAvailable !== false,
        ownerNumber: formData.ownerNumber || '',
        userId: userId
      };
      
      const updated = await databases.updateDocument(
        DATABASES.MAIN,
        COLLECTIONS.LISTINGS,
        id,
        updateData
      );

      if (updated) {
        toast.dismiss(loadingToast);
        toast.success('Flat updated successfully!');
        
        setTimeout(() => {
          navigate(`/flat/${id}`);
        }, 1000);
      }
      
    } catch (err) {
      console.error("Error updating flat:", err);
      setError(err.message || "Failed to update your flat. Please try again.");
      toast.error(err.message || "Failed to update your flat");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading flat data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-6">Edit Flat Details</h1>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <span>Updating your flat...</span>
          </div>
        </div>
      )}
      <FlatForm 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialData={flatData}
        isEditMode={true}
        submitButtonText="Update Flat"
      />
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default EditFlat;