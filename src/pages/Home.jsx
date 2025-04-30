import { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import Card from '../components/Card';
import { motion } from 'framer-motion';
import useLocation from '../hooks/useLocation';
import { filterByDistance } from '../utils/geoUtils';
import { flatsDb } from '../services/appwrite';
import { Query } from 'appwrite';

const Home = () => {
  // State for listings and filters
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    maxPrice: 100000,
    minPrice: 0,
    propertyType: 'Any',
    sortBy: 'Newest',
    nearMe: false,
    maxDistance: 10 // in km
  });

  // Get user location using our custom hook - autoRequest will trigger on component mount
  const { 
    location: userLocation, 
    getCurrentPosition, 
    loading: locationLoading,
    error: locationError,
    permissionStatus,
    isDefaultLocation
  } = useLocation({ autoRequest: true });

  // Fetch listings from Appwrite
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Define queries based on current filters
        const queries = [
          // Add isAvailable filter
          Query.equal('isAvailable', true)
        ];
        
        // Add a query for property type
        if (filters.propertyType !== 'Any') {
          queries.push(Query.equal('type', filters.propertyType));
        }
        
        // Add price range queries
        if (filters.minPrice > 0) {
          queries.push(Query.greaterThanEqual('rent', filters.minPrice));
        }
        
        if (filters.maxPrice < 100000) {
          queries.push(Query.lessThanEqual('rent', filters.maxPrice));
        }
        
        // Fetch listings from Appwrite with queries
        const response = await flatsDb.getAllFlats(queries);
        
        // Check if response has expected structure with documents array
        const documentsArray = response?.documents || [];
        
        if (!Array.isArray(documentsArray)) {
          console.error('Unexpected response format:', response);
          throw new Error('Invalid data format received from server');
        }
        
        // Process and format listings
        const formattedListings = documentsArray.map(item => {
          // Handle both Appwrite document format and fallback format
          const id = item.$id || item.id;
          const title = item.title || '';
          const price = item.rent || item.price || 0;
          
          // Handle location object which might be nested differently
          let locationObj = { latitude: 0, longitude: 0, address: 'Unknown' };
          if (item.location) {
            if (typeof item.location === 'object') {
              locationObj = {
                latitude: item.location.latitude || 0,
                longitude: item.location.longitude || 0,
                address: item.location.address || ''
              };
            } else if (typeof item.location === 'string') {
              locationObj.address = item.location;
            }
          } else if (item.latitude && item.longitude) {
            // If location is stored as separate fields
            locationObj = {
              latitude: item.latitude || 0,
              longitude: item.longitude || 0,
              address: item.address || ''
            };
          }
          
          return {
            ...item,
            id, // Ensure id is available at top level
            title,
            price, 
            location: locationObj
          };
        });
        
        setListings(formattedListings);
        setFilteredListings(formattedListings);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters.propertyType, filters.minPrice, filters.maxPrice]);

  // Apply client-side filters when filters state or listings change
  useEffect(() => {
    if (listings.length === 0) return;

    let result = [...listings];

    // We already filter by property type and price range in the API query
    // So only apply additional filters here that weren't part of the API query

    // Filter by location search text
    if (filters.location.trim()) {
      const searchTerm = filters.location.toLowerCase();
      result = result.filter(
        item => {
          const address = item.location?.address || item.address || '';
          return address.toLowerCase().includes(searchTerm);
        }
      );
    }

    // Filter by distance if "Near Me" is active and we have user location
    if (filters.nearMe && userLocation) {
      result = filterByDistance(result, userLocation, filters.maxDistance);
    }

    // Apply sorting
    switch(filters.sortBy) {
      case 'Lowest Price':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'Highest Price':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'Nearest':
        if (userLocation) {
          // The filterByDistance already adds distance property
          result.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }
        break;
      case 'Newest':
      default:
        // Sort by createdAt if available (newest first)
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
        break;
    }

    setFilteredListings(result);
  }, [filters.location, filters.nearMe, filters.maxDistance, filters.sortBy, listings, userLocation]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Handle "Near Me" button click
  const handleNearMeClick = () => {
    if (!userLocation) {
      getCurrentPosition();
    }
    setFilters(prev => ({ ...prev, nearMe: !prev.nearMe }));
  };

  // Close location prompt
  const handleCloseLocationPrompt = () => {
    setShowLocationPrompt(false);
  };

  // Try again to get location
  const handleTryAgain = () => {
    getCurrentPosition();
  };

  return (
    <div className="">
      {/* Location Permission Prompt */}
      {showLocationPrompt && permissionStatus !== 'granted' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-4 mb-4 rounded-lg shadow-md mx-auto max-w-7xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-textDark">
                {isDefaultLocation ? 'Using Jaipur, Jagatpura as your location' : 'Allow location access?'}
              </h3>
              <p className="text-sm text-textLight mt-1">
                {isDefaultLocation 
                  ? 'We\'re currently showing properties based on a default location. Allow location access to see rental properties near your actual location.'
                  : 'To show you rental properties near you, we need your location. This helps us calculate distances and show relevant results.'}
              </p>
            </div>
            <button 
              onClick={handleCloseLocationPrompt} 
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="mt-3 flex space-x-3">
            {permissionStatus === 'denied' && (
              <button 
                onClick={handleTryAgain}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                {locationLoading ? 'Getting Location...' : 'Try Again'}
              </button>
            )}
            <button 
              onClick={handleCloseLocationPrompt}
              className="px-4 py-2 bg-gray-200 text-textDark rounded-md hover:bg-gray-300 transition duration-200"
            >
              {isDefaultLocation ? 'Continue with Default' : 'Not Now'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-20 mb-12"
        style={{ backgroundImage: 'url(https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)' }}
      >
        <div className="absolute inset-0  bg-black bg-opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.img 
            src="/icon.png" 
            alt="Icon" 
            className="w-32 h-32 mx-auto mb-4 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white sm:text-5xl mb-4"
          >
            Find Your Perfect Stay
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-xl text-white mb-8"
          >
            Flat, Room, PG or Hostel – All in One Place
          </motion.p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <FilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onNearMeClick={handleNearMeClick}
          locationEnabled={!!userLocation}
          locationLoading={locationLoading}
        />
        {locationError && !isDefaultLocation && (
          <p className="text-red-500 text-sm mt-2">
            {locationError.message || "Error accessing your location"}
          </p>
        )}
        {isDefaultLocation && filters.nearMe && (
          <p className="text-blue-500 text-sm mt-2">
            Using default location (Jaipur, Jagatpura) for nearby listings
          </p>
        )}
      </section>

      {/* Listings Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-textDark">
            {filters.nearMe && userLocation ? 'Nearby Listings' : 'Featured Listings'}
            {import.meta.env.DEV && listings.length > 0 && listings[0].id && ' (Development Mode)'}
          </h2>
          <span className="text-textLight">
            {filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'} found
          </span>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full border-t-primary animate-spin"></div>
            <p className="text-textLight">Loading listings, please wait...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-xl text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition duration-200"
            >
              Try Again
            </button>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredListings.map((listing) => (
              <Card key={listing.id || listing.$id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-xl text-textLight">No listings found matching your criteria.</p>
            <button 
              onClick={() => setFilters({
                location: '',
                maxPrice: 100000,
                minPrice: 0,
                propertyType: 'Any',
                sortBy: 'Newest',
                nearMe: false,
                maxDistance: 10
              })}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition duration-200"
            >
              Reset Filters
            </button>
          </div>
        )}
        
        {import.meta.env.DEV && !error && listings.length > 0 && listings[0].id && (
          <div className="mt-10 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-blue-800 font-medium">Development Mode</p>
            <p className="text-blue-600 text-sm mt-1">
              You're seeing placeholder data because the Appwrite connection is not configured properly.
              Please check your environment variables.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
