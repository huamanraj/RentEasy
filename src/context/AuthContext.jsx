import { createContext, useState, useEffect, useContext } from 'react';
import { account } from '../utils/appwriteConfig';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appwriteReady, setAppwriteReady] = useState(true);

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      if (error.code === 401) {
        setUser(null);
      } else {
        console.error('Session check failed:', error);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    if (!appwriteReady) {
      throw new Error('Authentication service not ready.');
    }
    
    try {
      await account.createEmailPasswordSession(email, password);
      await checkUserSession();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const register = async (email, password, name) => {
    if (!appwriteReady) {
      throw new Error('Authentication service not ready.');
    }
    
    try {
      await account.create('unique()', email, password, name);
      await login(email, password);
      
      await account.updatePrefs({
        userName: name
      });
      
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    appwriteReady,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
