import React, { useState, useEffect, useRef } from 'react';
import { User, LogIn, Upload, Home, LogOut, UserCircle, Info, Phone, Menu, X, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import useDebounce from '../hooks/useDebounce';
import { allSearchableSubjects } from '../data/universities';
import type { SearchableSubject } from '../types';
import SearchResultsDropdown from './SearchResultsDropdown';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms debounce
  const [searchResults, setSearchResults] = useState<SearchableSubject[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
          setDisplayName(user.user_metadata.full_name);
        } else {
          setDisplayName('');
        }
      }, [user]);

  useEffect(() => {
    if (debouncedSearchQuery) {
      const lowerCaseQuery = debouncedSearchQuery.toLowerCase();
      const filteredResults = allSearchableSubjects.filter(subject =>
        subject.subjectName.toLowerCase().includes(lowerCaseQuery) ||
        subject.universityName.toLowerCase().includes(lowerCaseQuery) ||
        subject.courseName.toLowerCase().includes(lowerCaseQuery)
      );
      setSearchResults(filteredResults);
      setIsSearchDropdownOpen(true); // Open dropdown if there's a query
    } else {
      setSearchResults([]);
      setIsSearchDropdownOpen(false); // Close dropdown if query is empty
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchContainerRef]);


  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getFirstName = (fullName: string | null | undefined) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchFocus = () => {
    if (searchQuery) {
       setIsSearchDropdownOpen(true);
    }
  };

  const handleResultClick = () => {
    setSearchQuery(''); // Clear search query on result click
    setSearchResults([]); // Clear results
    setIsSearchDropdownOpen(false); // Close dropdown
    closeMobileMenu(); // Close mobile menu if open
  };


  const mobileMenuVariants = {
    hidden: { opacity: 0, y: "-10%" },
    visible: { opacity: 1, y: "0%", transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, y: "-10%", transition: { duration: 0.3, ease: "easeInOut" } },
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => {navigate('/'); closeMobileMenu();}}
            >
              <User className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EduPapers</span>
            </div>
            <div className="hidden md:flex items-center space-x-4 ml-6">
              <Link
                to="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
              >
                <Home className="h-5 w-5 mr-1" />
                Home
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
              >
                <Info className="h-5 w-5 mr-1" />
                About Us
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
              >
                <Phone className="h-5 w-5 mr-1" />
                Contact Us
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
             {/* Search Bar (Desktop) */}
            <div className="hidden md:flex relative" ref={searchContainerRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search subjects..."
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-80" // Increased width further
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchFocus}
                  ref={searchInputRef}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {isSearchDropdownOpen && searchResults.length > 0 && (
                 <SearchResultsDropdown results={searchResults} query={searchQuery} onResultClick={handleResultClick} />
              )}
               {isSearchDropdownOpen && searchQuery && searchResults.length === 0 && (
                 <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-md mt-1 p-3 text-gray-500 text-sm z-20">No results found</div>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 focus:outline-none hover:bg-gray-100 rounded-md p-1 transition-colors duration-200"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.full_name || 'User'}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <UserCircle className="h-8 w-8 text-gray-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {getFirstName(displayName)}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                >
                  <LogIn className="h-5 w-5 mr-1" />
                  Login
                </Link>
              )}

              <Link
                to="/upload"
                className="btn-primary flex items-center hover:bg-indigo-500"
              >
                <Upload className="h-5 w-5 mr-1" />
                Upload Papers
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                type="button"
                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-16 left-0 w-full bg-white shadow-md z-10 backdrop-filter backdrop-blur-lg bg-opacity-80"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
             {/* Search Bar (Mobile) */}
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 relative" ref={searchContainerRef}>
               <div className="relative">
                <input
                  type="text"
                  placeholder="Search subjects..."
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                   onFocus={handleSearchFocus}
                   ref={searchInputRef}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
               {isSearchDropdownOpen && searchResults.length > 0 && (
                 <SearchResultsDropdown results={searchResults} query={searchQuery} onResultClick={handleResultClick} />
              )}
               {isSearchDropdownOpen && searchQuery && searchResults.length === 0 && (
                 <div className="p-3 text-gray-500 text-sm">No results found</div>
              )}
            </div>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="text-gray-700 hover:bg-gray-100 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                <Home className="h-5 w-5 mr-1 inline-block align-middle" />
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:bg-gray-100 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                <Info className="h-5 w-5 mr-1 inline-block align-middle" />
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:bg-gray-100 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                <Phone className="h-5 w-5 mr-1 inline-block align-middle" />
                Contact Us
              </Link>
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:bg-gray-100 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    <UserCircle className="h-5 w-5 mr-1 inline-block align-middle" />
                    Profile
                  </Link>
                  <button
                    onClick={() => { handleLogout(); closeMobileMenu(); }}
                    className="text-gray-700 hover:bg-gray-100 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    <LogOut className="h-5 w-5 mr-1 inline-block align-middle" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-700 hover:bg-gray-100 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={closeMobileMenu}
                >
                  <LogIn className="h-5 w-5 mr-1 inline-block align-middle" />
                  Login
                </Link>
              )}
              <Link
                to="/upload"
                className="btn-primary block px-3 py-2 rounded-md text-base font-medium text-center"
                onClick={closeMobileMenu}
              >
                <Upload className="h-5 w-5 mr-1 inline-block align-middle" />
                Upload Papers
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
