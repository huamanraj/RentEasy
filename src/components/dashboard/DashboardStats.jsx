import React from 'react';

const DashboardStats = ({ flats }) => {
  // Calculate stats
  const totalFlats = flats.length;
  const availableFlats = flats.filter(flat => flat.isAvailable).length;
  const bookedFlats = flats.filter(flat => !flat.isAvailable).length;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <h3 className="font-medium text-gray-800 mb-3">Quick Stats</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Total listings:</span>
          <span className="font-medium">{totalFlats}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Available:</span>
          <span className="font-medium">{availableFlats}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Booked:</span>
          <span className="font-medium">{bookedFlats}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
