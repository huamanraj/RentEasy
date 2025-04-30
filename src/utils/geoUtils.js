/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param {number} lat1 Latitude of the first point.
 * @param {number} lon1 Longitude of the first point.
 * @param {number} lat2 Latitude of the second point.
 * @param {number} lon2 Longitude of the second point.
 * @returns {number} The distance in kilometers.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if ((lat1 === lat2) && (lon1 === lon2)) {
    return 0;
  }

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
};

/**
 * Converts degrees to radians.
 * @param {number} deg Degrees.
 * @returns {number} Radians.
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Filters a list of items based on their distance from a reference point.
 * @param {Array<Object>} items Array of items, each having a `location` property like { latitude: number, longitude: number }.
 * @param {Object} referenceLocation The reference point { latitude: number, longitude: number }.
 * @param {number} maxDistanceKm The maximum distance in kilometers.
 * @returns {Array<Object>} The filtered array of items within the specified distance.
 */
export const filterByDistance = (items, referenceLocation, maxDistanceKm) => {
  if (!referenceLocation || !items) {
    return items || []; // Return original items if no reference location
  }

  return items.filter(item => {
    if (!item.location || typeof item.location.latitude !== 'number' || typeof item.location.longitude !== 'number') {
      return false; // Skip items without valid location data
    }
    const distance = calculateDistance(
      referenceLocation.latitude,
      referenceLocation.longitude,
      item.location.latitude,
      item.location.longitude
    );
    item.distance = distance; // Optionally add distance to the item object
    return distance <= maxDistanceKm;
  });
};

/**
 * Sorts a list of items based on their distance from a reference point.
 * Requires items to have a `distance` property calculated beforehand or calculates it on the fly.
 * @param {Array<Object>} items Array of items, each having a `location` property like { latitude: number, longitude: number }.
 * @param {Object} referenceLocation The reference point { latitude: number, longitude: number }.
 * @returns {Array<Object>} The sorted array of items (closest first).
 */
export const sortByDistance = (items, referenceLocation) => {
   if (!referenceLocation || !items) {
    return items || [];
  }

  // Ensure distance is calculated for sorting if not already present
  items.forEach(item => {
     if (item.location && typeof item.distance === 'undefined') {
         item.distance = calculateDistance(
            referenceLocation.latitude,
            referenceLocation.longitude,
            item.location.latitude,
            item.location.longitude
         );
     } else if (typeof item.distance === 'undefined') {
         item.distance = Infinity; // Place items without location at the end
     }
  });

  return items.sort((a, b) => a.distance - b.distance);
};
