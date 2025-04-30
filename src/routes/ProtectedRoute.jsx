import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types'; // Import PropTypes

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading indicator while checking auth status
    // You can replace this with a more sophisticated loading spinner
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    // User not logged in, redirect them to the login page
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" replace />;
  }

  // User is logged in, render the child components
  return children;
};

// Add prop validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};


export default ProtectedRoute;
