import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Map, AlertCircle, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  const navLinks = [
    {
      name: 'Map',
      path: '/map',
      icon: <Map size={18} />,
      protected: true
    },
    {
      name: 'Crime Feed',
      path: '/crimes',
      icon: <AlertCircle size={18} />,
      protected: true
    }
  ];
  
  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled || location.pathname !== '/' 
          ? 'bg-white shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Shield className={`h-8 w-8 ${
              isScrolled || location.pathname !== '/' ? 'text-blue-700' : 'text-yellow-400'
            }`} />
            <span className={`ml-2 text-xl font-bold ${
              isScrolled || location.pathname !== '/' ? 'text-blue-900' : 'text-white'
            }`}>
              ShaktiPath
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              (!link.protected || isAuthenticated) && (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path 
                      ? (isScrolled || location.pathname !== '/' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-white/20 text-white')
                      : (isScrolled || location.pathname !== '/' 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-white/80 hover:bg-white/20 hover:text-white')
                  }`}
                >
                  {link.icon}
                  <span className="ml-1">{link.name}</span>
                </Link>
              )
            ))}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={logout}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                    isScrolled || location.pathname !== '/' 
                      ? 'bg-blue-700 text-white hover:bg-blue-800' 
                      : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                  }`}
                >
                  <LogOut size={18} className="mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    isScrolled || location.pathname !== '/' 
                      ? 'text-blue-700 hover:text-blue-800' 
                      : 'text-white hover:text-white/80'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    isScrolled || location.pathname !== '/' 
                      ? 'bg-blue-700 text-white hover:bg-blue-800' 
                      : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-md ${
                isScrolled || location.pathname !== '/' 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              (!link.protected || isAuthenticated) && (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === link.path 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.icon}
                  <span className="ml-2">{link.name}</span>
                </Link>
              )
            ))}
            
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <User size={18} className="mr-2" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-blue-700 text-white hover:bg-blue-800"
                >
                  <User size={18} className="mr-2" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;