import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ImageGallery from '../components/ImageGallery';
import FlatDetails from '../components/FlatDetails';
import ReviewSection from '../components/ReviewSection';
import { flatsDb } from '../services/appwrite';

const FlatDetailsPage = () => {
  const { id } = useParams();
  const [flatData, setFlatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugMode] = useState(import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true');

  useEffect(() => {
    const fetchFlatData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) {
          throw new Error("No flat ID provided");
        }
        
        // Fetch the flat data using our appwrite service
        const data = await flatsDb.getFlat(id);
        
        console.log("Fetched flat data:", data);
        
        // Ensure images is properly formatted as an array
        const processedData = {
          ...data,
          // Convert images to array if it's not already
          images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
          // Make sure video is properly formatted
          video: data.video || null,
          // Ensure ownerNumber is included
          ownerNumber: data.ownerNumber || null
        };
        
        console.log("Processed flat data for display:", processedData);
        setFlatData(processedData);
      } catch (err) {
        console.error("Error fetching flat data:", err);
        setError(`Failed to load flat details: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFlatData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-textLight">Loading flat details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 p-6 rounded-lg border border-red-100">
          <h2 className="text-2xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!flatData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
          <h2 className="text-2xl font-semibold text-yellow-700 mb-2">Flat Not Found</h2>
          <p className="text-yellow-600">The flat with ID {id} could not be found.</p>
        </div>
      </div>
    );
  }

  // Extract the price from rent for consistency
  const preparedFlatData = {
    ...flatData,
    price: flatData.rent || flatData.price // Ensure price is available for components that expect it
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {import.meta.env.DEV && (
        <div className="mb-6 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
          Development Mode: Viewing flat ID: {id}
        </div>
      )}
      
      {/* Debug info - only shown in debug mode */}
      {debugMode && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-auto text-xs">
          <h3 className="font-bold mb-2">Debug Data:</h3>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify({
              ownerNumber: preparedFlatData.ownerNumber,
              flatDataKeys: Object.keys(preparedFlatData),
            }, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-2">
          <ImageGallery 
            images={preparedFlatData.images} 
            video={preparedFlatData.video}
          />
        </div>

        {/* Right Column: Details & Booking */}
        <div className="lg:col-span-1 space-y-8">
           <FlatDetails flat={preparedFlatData} />
        </div>
      </div>

      {/* Full Width Section: Reviews */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <ReviewSection flatId={id} />
      </div>
    </div>
  );
};

export default FlatDetailsPage;
