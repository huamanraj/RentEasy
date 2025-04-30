import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Loader } from 'lucide-react';

const FilterBar = ({ 
  filters, 
  onFilterChange, 
  onNearMeClick,
  locationEnabled = false, 
  locationLoading = false 
}) => {
  // Reference to track if component is mounted
  const isMounted = useRef(true);
  
  // Local state for input values
  const [locationInput, setLocationInput] = useState(filters.location || '');
  const [priceRange, setPriceRange] = useState(filters.maxPrice || 100000);
  // Ref for debounce timeout
  const locationTimeoutRef = useRef(null);

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, []);

  // Update local state when filters prop changes - but only when it's not user input
  useEffect(() => {
    // This prevents the filters.location from overriding the user's input while typing
    if (filters.location !== locationInput && document.activeElement?.id !== 'location') {
      setLocationInput(filters.location || '');
    }
    setPriceRange(filters.maxPrice || 100000);
  }, [filters, locationInput]);

  // Debounced handler for location search
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);
    
    // Clear any existing timeout to prevent multiple calls
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }
    
    // Debounce to avoid too many re-filters as user types
    locationTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        onFilterChange({ location: value });
      }
    }, 500);
  };
  
  // Handler for price range slider
  const handlePriceChange = (e) => {
    const value = Number(e.target.value);
    setPriceRange(value);
    onFilterChange({ maxPrice: value });
  };

  // Handler for property type selection
  const handleTypeChange = (e) => {
    onFilterChange({ propertyType: e.target.value });
  };
  
  // Handler for sorting selection
  const handleSortChange = (e) => {
    onFilterChange({ sortBy: e.target.value });
  };

  // Format price for display
  const formatPrice = (price) => {
    return price >= 100000 ? "₹1L+" : `₹${price.toLocaleString()}`;
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-[18px] shadow-sm mb-8 border border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Location Filter */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input 
            type="text" 
            id="location" 
            value={locationInput}
            onChange={handleLocationChange}
            placeholder="Enter city or area" 
            className="w-full p-2 border border-gray-300 rounded-[18px] focus:ring-primary focus:border-primary" 
          />
        </div>

        {/* Price Range Filter */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price Range (up to {formatPrice(priceRange)})
          </label>
          <input 
            type="range" 
            id="price" 
            min="1000" 
            max="100000" 
            step="1000" 
            value={priceRange}
            onChange={handlePriceChange}
            className="w-full h-2 bg-gray-200 rounded-[18px] appearance-none cursor-pointer accent-primary" 
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>₹1,000</span>
            <span>₹1L+</span>
          </div>
        </div>

        {/* Property Type Filter */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select 
            id="type" 
            value={filters.propertyType}
            onChange={handleTypeChange}
            className="w-full p-2 border border-gray-300 rounded-[18px] focus:ring-primary focus:border-primary"
          >
            <option value="Any">Any</option>
            <option value="1RK">1RK</option>
            <option value="1BHK">1BHK</option>
            <option value="2BHK">2BHK</option>
            <option value="3BHK">3BHK</option>
            <option value="3BHK+">3BHK+</option>
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select 
            id="sort" 
            value={filters.sortBy}
            onChange={handleSortChange}
            className="w-full p-2 border border-gray-300 rounded-[18px] focus:ring-primary focus:border-primary"
          >
            <option value="Newest">Newest</option>
            <option value="Lowest Price">Lowest Price</option>
            <option value="Highest Price">Highest Price</option>
            <option value="Nearest">Nearest</option>
          </select>
        </div>

        {/* Near Me Button */}
        <div className="flex items-end">
          <button 
            onClick={onNearMeClick}
            disabled={locationLoading}
            className={`w-full flex justify-center items-center p-2 rounded-[18px] transition duration-200 ${
              filters.nearMe 
                ? 'bg-primary text-white hover:bg-red-700' 
                : 'bg-gray-100 text-textDark hover:bg-gray-200'
            } ${locationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {locationLoading ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <MapPin className={`w-5 h-5 mr-2 ${filters.nearMe ? 'text-white' : 'text-gray-500'}`} />
            )}
            {filters.nearMe ? 'Located Near Me' : 'Near Me'}
          </button>
        </div>
      </div>

      {/* Active filters display */}
      {(filters.location || filters.propertyType !== 'Any' || filters.maxPrice !== 100000 || filters.nearMe) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          
          {filters.location && (
            <span className="bg-gray-100 text-textDark text-sm px-2 py-1 rounded-[18px] flex items-center">
              Location: {filters.location}
              <button 
                onClick={() => {
                  setLocationInput('');
                  onFilterChange({ location: '' });
                }} 
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.propertyType !== 'Any' && (
            <span className="bg-gray-100 text-textDark text-sm px-2 py-1 rounded-[18px] flex items-center">
              Type: {filters.propertyType}
              <button 
                onClick={() => onFilterChange({ propertyType: 'Any' })} 
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.maxPrice !== 100000 && (
            <span className="bg-gray-100 text-textDark text-sm px-2 py-1 rounded-[18px] flex items-center">
              Max: {formatPrice(filters.maxPrice)}
              <button 
                onClick={() => {
                  setPriceRange(100000);
                  onFilterChange({ maxPrice: 100000 });
                }} 
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.nearMe && (
            <span className="bg-primary bg-opacity-10 text-primary text-sm px-2 py-1 rounded-[18px] flex items-center">
              Near Me {locationEnabled ? '✓' : '!'}
              <button 
                onClick={() => onFilterChange({ nearMe: false })} 
                className="ml-1 text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </span>
          )}
          
          <button 
            onClick={() => {
              setLocationInput('');
              setPriceRange(100000);
              onFilterChange({
                location: '',
                maxPrice: 100000,
                propertyType: 'Any',
                sortBy: 'Newest',
                nearMe: false,
              });
            }}
            className="text-sm text-primary hover:underline ml-auto"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

FilterBar.propTypes = {
  filters: PropTypes.shape({
    location: PropTypes.string,
    minPrice: PropTypes.number,
    maxPrice: PropTypes.number,
    propertyType: PropTypes.string,
    sortBy: PropTypes.string,
    nearMe: PropTypes.bool,
  }),
  onFilterChange: PropTypes.func.isRequired,
  onNearMeClick: PropTypes.func.isRequired,
  locationEnabled: PropTypes.bool,
  locationLoading: PropTypes.bool,
};

export default FilterBar;
