import { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import Card from '../components/Card';
import { motion } from 'framer-motion';
import useLocation from '../hooks/useLocation';
import { filterByDistance } from '../utils/geoUtils';
import { flatsDb } from '../services/appwrite';
import { Query } from 'appwrite';
import LoginModal from '../components/LoginModal';
import LocationPromptDialog from '../components/LocationPromptDialog';

const Home = () => {
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
    maxDistance: 10
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 12;

  const { 
    location: userLocation, 
    getCurrentPosition, 
    loading: locationLoading,
    error: locationError,
    permissionStatus,
    isDefaultLocation
  } = useLocation({ autoRequest: true });

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const queries = [
          Query.equal('isAvailable', true)
        ];
        
        if (filters.propertyType !== 'Any') {
          queries.push(Query.equal('type', filters.propertyType));
        }
        
        if (filters.minPrice > 0) {
          queries.push(Query.greaterThanEqual('rent', filters.minPrice));
        }
        
        if (filters.maxPrice < 100000) {
          queries.push(Query.lessThanEqual('rent', filters.maxPrice));
        }

        if (filters.location.trim()) {
          const searchTerm = filters.location.trim().toLowerCase();
          queries.push(
            Query.or([
              Query.contains('title', [searchTerm]),
              Query.contains('address', [searchTerm])
            ])
          );
        }

        switch(filters.sortBy) {
          case 'Lowest Price':
            queries.push(Query.orderAsc('rent'));
            break;
          case 'Highest Price':
            queries.push(Query.orderDesc('rent'));
            break;
          case 'Newest':
          default:
            queries.push(Query.orderDesc('$createdAt'));
            break;
        }
        
        const response = await flatsDb.getAllFlats(queries);
        
        const documentsArray = response?.documents || [];
        
        if (!Array.isArray(documentsArray)) {
          throw new Error('Invalid data format received from server');
        }

        const formattedListings = documentsArray.map(item => {
          const id = item.$id || item.id;
          const title = item.title || '';
          const price = item.rent || item.price || 0;
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
            locationObj = {
              latitude: item.latitude || 0,
              longitude: item.longitude || 0,
              address: item.address || ''
            };
          }
          return {
            ...item,
            id,
            title,
            price, 
            location: locationObj
          };
        });
        
        let filteredResults = formattedListings;
        if (filters.nearMe && userLocation) {
          filteredResults = filterByDistance(filteredResults, userLocation, filters.maxDistance);
          if (filters.sortBy === 'Nearest') {
            filteredResults.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          }
        }
        setListings(filteredResults);
        setFilteredListings(filteredResults.slice(0, page * ITEMS_PER_PAGE));
        setHasMore(filteredResults.length > page * ITEMS_PER_PAGE);
      } catch (err) {
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters, userLocation, page]);

  useEffect(() => {
    if (permissionStatus === 'granted') {
      setShowLocationPrompt(false);
    }
  }, [permissionStatus]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleNearMeClick = () => {
    if (!userLocation) {
      getCurrentPosition();
    }
    setFilters(prev => ({ ...prev, nearMe: !prev.nearMe }));
  };

  const handleCloseLocationPrompt = () => {
    setShowLocationPrompt(false);
  };

  const handleTryAgain = () => {
    getCurrentPosition();
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className=""> 
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <LocationPromptDialog 
        isOpen={showLocationPrompt}
        onClose={handleCloseLocationPrompt}
        onTryAgain={handleTryAgain}
        isDefaultLocation={isDefaultLocation}
        locationLoading={locationLoading}
        permissionStatus={permissionStatus}
      />

      <section
        className="relative bg-cover bg-center py-20 mb-12"
        style={{ backgroundImage: 'url(https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)' }}
      >
        <div className="absolute inset-0  bg-black bg-opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.img 
            src="/icon.png" 
            alt="Icon" 
            className="w-32 h-32 mx-auto mb-4 "
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className=" hidden sm:block sm:absolute bottom-4 right-4 text-white text-sm cursor-pointer hover:underline"
            onClick={() => setShowLoginModal(true)}
          >
            Register as owner to post your flats, rooms and PGs →
          </motion.p>
        </div>
      </section>

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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-textDark">
            {filters.nearMe && userLocation ? 'Nearby Listings' : 'Featured Listings'}
          </h2>
          <span className="text-textLight">
            {listings.length} {listings.length === 1 ? 'property' : 'properties'} found
          </span>
        </div>
        
        {loading && page === 1 ? (
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredListings.map((listing) => (
                <Card key={listing.id} listing={listing} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition duration-200"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-xl text-textLight">No listings found matching your criteria.</p>
            <button 
              onClick={() => {
                setPage(1);
                setFilters({
                  location: '',
                  maxPrice: 100000,
                  minPrice: 0,
                  propertyType: 'Any',
                  sortBy: 'Newest',
                  nearMe: false,
                  maxDistance: 10
                });
              }}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition duration-200"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
