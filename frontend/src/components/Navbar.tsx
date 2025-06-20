import React, { useState, useEffect, useRef } from 'react';
import { User, LogIn, Upload, Home, LogOut, UserCircle, Info, Phone, Menu, X, Search, Moon, Sun } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { motion, AnimatePresence } from 'framer-motion';
import useDebounce from '../hooks/useDebounce';
import { allSearchableSubjects } from '../data/universities';
import type { SearchableSubject } from '../types';
import SearchResultsDropdown from './SearchResultsDropdown';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [displayName, setDisplayName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms debounce
  const [searchResults, setSearchResults] = useState<SearchableSubject[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
          setDisplayName(user.user_metadata.full_name);
        } else {
          setDisplayName('');
        }
      }, [user]);

  useEffect(() => {
    if (searchQuery && searchQuery !== debouncedSearchQuery) {
      setIsSearchLoading(true);
    }
  }, [searchQuery, debouncedSearchQuery]);

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
      setIsSearchLoading(false);
    } else {
      setSearchResults([]);
      setIsSearchDropdownOpen(false); // Close dropdown if query is empty
      setIsSearchLoading(false);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const desktopSearch = searchContainerRef.current;
      const mobileSearch = mobileSearchRef.current;
      
      if (desktopSearch && !desktopSearch.contains(event.target as Node) &&
          mobileSearch && !mobileSearch.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
        setIsMobileSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


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
    setIsMobileSearchFocused(false);
    setIsSearchDropdownOpen(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchFocus = () => {
    if (searchQuery) {
       setIsSearchDropdownOpen(true);
    }
    setIsMobileSearchFocused(true);
  };

  const handleMobileSearchFocus = () => {
    setIsMobileSearchFocused(true);
    if (searchQuery) {
       setIsSearchDropdownOpen(true);
    }
  };

  const handleResultClick = () => {
    setSearchQuery(''); // Clear search query on result click
    setSearchResults([]); // Clear results
    setIsSearchDropdownOpen(false); // Close dropdown
    setIsMobileSearchFocused(false); // Reset mobile search focus
    setIsSearchLoading(false); // Reset loading state
    closeMobileMenu(); // Close mobile menu if open
  };


  const mobileMenuVariants = {
    hidden: { opacity: 0, y: "-10%" },
    visible: { opacity: 1, y: "0%", transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, y: "-10%", transition: { duration: 0.3, ease: "easeInOut" } },
  };

  return (
    <nav className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-md transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => {navigate('/'); closeMobileMenu();}}
            >
              <User className={`h-8 w-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={`ml-2 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>EduPapers</span>
            </div>
            <div className="hidden md:flex items-center space-x-4 ml-6">
              <Link
                to="/"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-600'} transition-colors duration-200`}
              >
                <Home className="h-5 w-5 mr-1" />
                Home
              </Link>
              <Link
                to="/about"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-600'} transition-colors duration-200`}
              >
                <Info className="h-5 w-5 mr-1" />
                About Us
              </Link>
              <Link
                to="/contact"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-600'} transition-colors duration-200`}
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
                  className={`pl-10 pr-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-400 focus:border-indigo-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md text-sm focus:outline-none w-80 transition-colors duration-200`}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchFocus}
                  ref={searchInputRef}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
              </div>
              {isSearchLoading && (
                <div className={`absolute top-full left-0 right-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg rounded-md mt-1 p-3 z-20 border transition-colors duration-200`}>
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Searching...</span>
                  </div>
                </div>
              )}
              {isSearchDropdownOpen && searchResults.length > 0 && !isSearchLoading && (
                 <SearchResultsDropdown results={searchResults} query={searchQuery} onResultClick={handleResultClick} />
              )}
               {isSearchDropdownOpen && searchQuery && searchResults.length === 0 && !isSearchLoading && (
                 <div className={`absolute top-full left-0 right-0 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white text-gray-500'} shadow-lg rounded-md mt-1 p-3 text-sm z-20 border transition-colors duration-200`}>No results found for "{searchQuery}"</div>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors duration-200`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className={`flex items-center space-x-2 focus:outline-none ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-md p-1 transition-colors duration-200`}
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.full_name || 'User'}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <UserCircle className={`h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    )}
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {getFirstName(displayName)}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-600'} transition-colors duration-200`}
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-600'} transition-colors duration-200`}
                >
                  <LogIn className="h-5 w-5 mr-1" />
                  Login
                </Link>
              )}

              <Link
                to="/upload"
                className={`btn-primary flex items-center ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-500'} transition-colors duration-200`}
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
                className={`${isDarkMode ? 'bg-gray-900 text-gray-300 hover:text-gray-100 hover:bg-gray-800' : 'bg-white text-gray-400 hover:text-gray-500 hover:bg-gray-100'} inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200`}
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
            className={`md:hidden fixed top-16 left-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg z-50 transition-colors duration-200`}
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
             {/* Search Bar (Mobile) */}
            <div className={`px-4 pt-4 pb-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b`} ref={mobileSearchRef}>
               <div className="relative">
                <input
                  type="text"
                  placeholder="Search subjects..."
                  className={`pl-10 pr-3 py-3 border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-400 focus:border-indigo-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500'} rounded-lg text-sm w-full focus:outline-none focus:ring-2 transition-colors duration-200`}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleMobileSearchFocus}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
              </div>
               {/* Mobile Search Results */}
               {searchQuery && (
                 <div className="mt-2">
                   {isSearchLoading ? (
                     <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border transition-colors duration-200`}>
                       <div className="flex items-center justify-center">
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                         <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Searching...</span>
                       </div>
                     </div>
                   ) : searchResults.length > 0 ? (
                     <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg max-h-60 overflow-y-auto border transition-colors duration-200`}>
                       {searchResults.map((subject, index) => (
                         <Link
                           key={index}
                           to={`/university/${subject.universityId}/course/${subject.courseId}/semester/${subject.semester}/${subject.subjectName.replace(/ /g, '-').toLowerCase()}`}
                           className={`block px-4 py-3 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700 active:bg-gray-600' : 'border-gray-200 hover:bg-gray-100 active:bg-gray-200'} border-b last:border-b-0 transition-colors duration-150`}
                           onClick={handleResultClick}
                         >
                           <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{subject.subjectName}</p>
                           <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                             {subject.universityName} - {subject.courseName} - Semester {subject.semester}
                           </p>
                         </Link>
                       ))}
                     </div>
                   ) : (
                     <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'} rounded-lg p-4 text-sm text-center border transition-colors duration-200`}>
                       No results found for "{searchQuery}"
                     </div>
                   )}
                 </div>
               )}
            </div>
            <div className="px-4 py-2 space-y-1">
              {/* Dark Mode Toggle (Mobile) */}
              <div className="flex items-center justify-between py-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dark Mode</span>
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors duration-200`}
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
              
              <Link
                to="/"
                className={`${isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-indigo-400' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'} flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200`}
                onClick={closeMobileMenu}
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </Link>
              <Link
                to="/about"
                className={`${isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-indigo-400' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'} flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200`}
                onClick={closeMobileMenu}
              >
                <Info className="h-5 w-5 mr-3" />
                About Us
              </Link>
              <Link
                to="/contact"
                className={`${isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-indigo-400' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'} flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200`}
                onClick={closeMobileMenu}
              >
                <Phone className="h-5 w-5 mr-3" />
                Contact Us
              </Link>
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className={`${isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-indigo-400' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'} flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200`}
                    onClick={closeMobileMenu}
                  >
                    <UserCircle className="h-5 w-5 mr-3" />
                    Profile
                  </Link>
                  <button
                    onClick={() => { handleLogout(); closeMobileMenu(); }}
                    className={`${isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-indigo-400' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'} flex items-center px-3 py-3 rounded-lg text-base font-medium w-full text-left transition-colors duration-200`}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className={`${isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-indigo-400' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'} flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200`}
                  onClick={closeMobileMenu}
                >
                  <LogIn className="h-5 w-5 mr-3" />
                  Login
                </Link>
              )}
              <Link
                to="/upload"
                className={`${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white flex items-center justify-center px-3 py-3 rounded-lg text-base font-medium mt-4 transition-colors duration-200`}
                onClick={closeMobileMenu}
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Papers
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
