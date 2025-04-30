import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, LogIn, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Jaipur, Jagatpura');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || 'Jaipur';
            setCurrentLocation(city);
          } catch (error) {
            setCurrentLocation('Jaipur');
          }
        },
        () => {
          // On error or denial, set default location
          setCurrentLocation('Jaipur');
        }
      );
    } else {
      setCurrentLocation('Jaipur');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <div className={`w-full fixed top-0 z-50 transition-all duration-300 ease-in-out ${isScrolled ? 'px-4 mt-4' : ''}`}>
        <nav className={`
          transition-all duration-300 ease-in-out
          ${isScrolled 
            ? 'w-[80%] bg-white/70 backdrop-blur-md shadow-lg rounded-full mx-auto' 
            : 'w-full bg-white/90'}
        `}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link to="/" className="text-2xl font-bold text-primary">
                    RentEasily
                  </Link>
                </div>
                {currentLocation && (
                  <div className="flex items-center ml-2 sm:ml-4">
                    <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-1"></span>
                    <span className="text-[10px] sm:text-xs text-red-500 truncate max-w-[80px] sm:max-w-[120px]">
                      {currentLocation}
                    </span>
                  </div>
                )}
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <Link to="/" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <Home size={18} className="mr-1" /> Home
                </Link>
                {user && (
                  <Link to="/post-flat" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <PlusSquare size={18} className="mr-1" /> Post Your Flat
                  </Link>
                )}
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
                  <button onClick={openLoginModal} className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <LogIn size={18} className="mr-1" /> Login/Register
                  </button>
                )}
              </div>

              <div className="md:hidden">
                <button 
                  onClick={toggleMobileMenu} 
                  className="text-gray-700 hover:text-primary p-2 rounded-md"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={handleOverlayClick}
          >
            <div className="bg-white min-h-fit max-h-[80vh] overflow-y-auto rounded-b-2xl relative">
              <button 
                onClick={toggleMobileMenu}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col items-center space-y-4 p-4 pt-20">
                <Link 
                  to="/" 
                  onClick={toggleMobileMenu}
                  className="flex flex-col items-center text-gray-700 hover:text-primary px-3 py-2"
                >
                  <Home size={24} />
                  <span className="mt-1">Home</span>
                </Link>

                {user && (
                  <Link 
                    to="/post-flat" 
                    onClick={toggleMobileMenu}
                    className="flex flex-col items-center text-gray-700 hover:text-primary px-3 py-2"
                  >
                    <PlusSquare size={24} />
                    <span className="mt-1">Post Your Flat</span>
                  </Link>
                )}

                {user ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      onClick={toggleMobileMenu}
                      className="flex flex-col items-center text-gray-700 hover:text-primary px-3 py-2"
                    >
                      <User size={24} />
                      <span className="mt-1">Dashboard</span>
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        toggleMobileMenu();
                      }}
                      className="flex flex-col items-center text-gray-700 hover:text-primary px-3 py-2"
                    >
                      <LogOut size={24} />
                      <span className="mt-1">Logout</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      openLoginModal();
                      toggleMobileMenu();
                    }}
                    className="flex flex-col items-center text-gray-700 hover:text-primary px-3 py-2"
                  >
                    <LogIn size={24} />
                    <span className="mt-1">Login/Register</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
};

export default Navbar;
