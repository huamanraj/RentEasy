import { createContext, useState, useEffect, useContext } from 'react';
import { account } from '../utils/appwriteConfig';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appwriteReady, setAppwriteReady] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      setEmailVerified(currentUser.emailVerification);
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
      const userId = crypto.randomUUID(); // Generate a unique ID
      await account.create(
        userId,
        email,
        password,
        name
      );
      
      // Login after successful registration
      await login(email, password);
      
      // Update preferences after successful login
      await account.updatePrefs({
        userName: name
      });
      
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.code === 400) {
        throw new Error('Invalid email or password format. Please check your inputs and try again.');
      } else if (error.code === 409) {
        throw new Error('An account with this email already exists.');
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  };

  const value = {
    user,
    loading,
    appwriteReady,
    emailVerified,
    login,
    logout,
    register,
    checkUserSession
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
