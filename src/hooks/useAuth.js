// This hook is essentially provided by the AuthContext itself.
// We just re-export the useContext hook for convenience.
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// No need to export default here if AuthContext already does
