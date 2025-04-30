import React, { useState, useEffect } from 'react';
import { flatsDb, databases, DATABASES, COLLECTIONS } from '../services/appwrite';
import { useNavigate } from 'react-router-dom';
import { Query } from 'appwrite';
import FlatCard from '../components/dashboard/FlatCard';
import DashboardStats from '../components/dashboard/DashboardStats';
import { account } from '../utils/appwriteConfig';

const Dashboard = () => {
  const [userFlats, setUserFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFlats, setTotalFlats] = useState(0);
  const [availableFields, setAvailableFields] = useState(null);
  const [userId, setUserId] = useState(null);
  const flatsPerPage = 10;
  
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
        console.log("Logged in user ID:", user.$id);
      } catch (err) {
        console.error("Error fetching current user:", err);
        setError("Please log in to view your listings");
        setLoading(false);
      }
    };
    
    getCurrentUser();
  }, []);

  useEffect(() => {
    const checkCollectionFields = async () => {
      try {
        if (!DATABASES.MAIN || !COLLECTIONS.LISTINGS) {
          console.warn('Database or collection IDs not found');
          return;
        }

        const response = await databases.listDocuments(
          DATABASES.MAIN,
          COLLECTIONS.LISTINGS,
          [Query.limit(1)]
        );
        
        if (response.documents && response.documents.length > 0) {
          const sampleDoc = response.documents[0];
          const fieldNames = Object.keys(sampleDoc);
          console.log("Available fields in collection:", fieldNames);
          setAvailableFields(fieldNames);
        } else {
          const defaultFields = ['$id', '$createdAt', '$updatedAt', 'title', 'description', 'status'];
          console.log("No documents found. Using default fields:", defaultFields);
          setAvailableFields(defaultFields);
        }
      } catch (err) {
        console.error("Error fetching collection schema:", err);
        const fallbackFields = ['$createdAt', '$updatedAt'];
        setAvailableFields(fallbackFields);
        console.log("Using fallback fields after error:", fallbackFields);
      }
    };
    
    checkCollectionFields();
  }, []);
  
  useEffect(() => {
    const fetchUserListings = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const offset = (currentPage - 1) * flatsPerPage;
        
        const queries = [
          Query.equal('userId', [userId]),
          Query.limit(flatsPerPage),
          Query.offset(offset)
        ];

        if (availableFields) {
          if (availableFields.includes('createdAt')) {
            queries.push(Query.orderDesc('createdAt'));
          } else if (availableFields.includes('$createdAt')) {
            queries.push(Query.orderDesc('$createdAt'));
          } else if (availableFields.includes('updatedAt')) {
            queries.push(Query.orderDesc('updatedAt'));
          } else if (availableFields.includes('$updatedAt')) {
            queries.push(Query.orderDesc('$updatedAt'));
          }
        }
        
        console.log(`Fetching flats for user ID: ${userId}`);
        const response = await flatsDb.getAllFlats(queries);
        
        if (Array.isArray(response)) {
          setUserFlats(response);
          setTotalFlats(response.length);
          setTotalPages(Math.max(1, Math.ceil(response.length / flatsPerPage)));
        } else if (response.documents) {
          setUserFlats(response.documents);
          setTotalFlats(response.total || response.documents.length);
          setTotalPages(Math.ceil((response.total || response.documents.length) / flatsPerPage));
        } else {
          console.warn("Unexpected response format:", response);
          setUserFlats([]);
          setTotalFlats(0);
          setTotalPages(1);
        }
        
        console.log("User flats data:", response);
      } catch (err) {
        console.error('Error fetching user listings:', err);
        setError('Failed to load your listings: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserListings();
  }, [currentPage, availableFields, userId]);

  const handleStatusChange = async (flatId, isAvailable) => {
    try {
      setLoading(true);
      
      await databases.updateDocument(
        DATABASES.MAIN,
        COLLECTIONS.LISTINGS,
        flatId,
        { isAvailable }
      );
        
      setUserFlats(flats => 
        flats.map(flat => 
          flat.$id === flatId ? {...flat, isAvailable} : flat
        )
      );
        
      setLoading(false);
    } catch (err) {
      console.error("Error updating availability:", err);
      alert("Failed to update availability: " + err.message);
      setLoading(false);
    }
  };
  
  const handleDelete = async (flatId) => {
    if (!confirm("Are you sure you want to delete this listing?")) {
      return;
    }
    
    try {
      setLoading(true);
      
      await databases.deleteDocument(
        DATABASES.MAIN,
        COLLECTIONS.LISTINGS,
        flatId
      );
      
      setUserFlats(flats => flats.filter(flat => flat.$id !== flatId));
      setTotalFlats(prev => prev - 1);
      setTotalPages(Math.ceil((totalFlats - 1) / flatsPerPage));
      
      if (userFlats.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error deleting flat:", err);
      alert("Failed to delete listing: " + err.message);
      setLoading(false);
    }
  };

  const navigateToPostFlat = () => {
    navigate('/post-flat');
  };
  
  const handleEditFlat = (flatId) => {
    navigate(`/edit-flat/${flatId}`);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const renderFlatCard = (flat) => {
    return (
      <FlatCard
        key={flat.$id || flat.id}
        flat={flat}
        onEdit={handleEditFlat}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-textDark mb-2">My Dashboard</h1>
      <p className="text-gray-600 mb-8">Manage your property listings</p>

      {!userId && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-textLight mb-4">Please log in to view your listings.</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-700 transition duration-200"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-textDark">My Listed Properties</h2>
              <button 
                onClick={navigateToPostFlat}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                + Post New Flat
              </button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-gray-200 rounded-full border-t-primary animate-spin"></div>
                <span className="ml-2 text-textLight">Loading your listings...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : userFlats && userFlats.length > 0 ? (
              <div className="space-y-4">
                {userFlats.map(flat => renderFlatCard(flat))}

                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * flatsPerPage) + 1} to {Math.min(currentPage * flatsPerPage, totalFlats)} of {totalFlats} listings
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        Previous
                      </button>
                      <div className="flex items-center px-2">
                        Page {currentPage} of {totalPages}
                      </div>
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-textLight mb-4">No flats found with your user ID ({userId}).</p>
                <button 
                  onClick={navigateToPostFlat}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Post Your First Flat
                </button>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <DashboardStats flats={userFlats} />
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-800 mb-3">Quick Links</h3>
              <div className="space-y-2">
                <button 
                  onClick={navigateToPostFlat}
                  className="w-full py-2 bg-gray-50 text-gray-800 rounded hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  New Listing
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full py-2 bg-gray-50 text-gray-800 rounded hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  My Profile
                </button>
                <button 
                  onClick={() => navigate('/messages')}
                  className="w-full py-2 bg-gray-50 text-gray-800 rounded hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  Messages
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
