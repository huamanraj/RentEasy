import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, LogIn, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirect to home after logout
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show an error message to the user
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <>
      <div className={`w-full fixed top-0 z-50 transition-all duration-300 ease-in-out ${isScrolled ? 'px-4' : ''}`}>
        <nav className={`
          transition-all duration-300 ease-in-out
          ${isScrolled 
            ? 'w-[80%] bg-white/70 backdrop-blur-md shadow-lg rounded-full mx-auto' 
            : 'w-full bg-white/90'}
        `}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to="/" className="text-2xl font-bold text-primary">
                  RentEasy
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <Home size={18} className="mr-1" /> Home
                </Link>
                {/* Show Post Flat only if logged in */}
                {user && (
                  <Link to="/post-flat" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <PlusSquare size={18} className="mr-1" /> Post Your Flat
                  </Link>
                )}
                {/* Conditional Rendering based on Auth Status */}
                {user ? (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                      <User size={18} className="mr-1" /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                      <LogOut size={18} className="mr-1" /> Logout
                    </button>
                  </>
                ) : (
                  // Use button to open modal instead of Link to /login page
                  <button onClick={openLoginModal} className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <LogIn size={18} className="mr-1" /> Login/Register
                  </button>
                )}
              </div>

              {/* Mobile Menu Button (implement later if needed) */}
              <div className="md:hidden">
                {/* Hamburger Icon - Add logic later */}
                <button onClick={user ? handleLogout : openLoginModal} className="text-gray-700 hover:text-primary p-2 rounded-md">
                  {user ? <LogOut size={24} /> : <LogIn size={24} />}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
};

export default Navbar;
