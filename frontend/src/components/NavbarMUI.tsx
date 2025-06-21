import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Box,
  Avatar,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Paper,
  ClickAwayListener,
  Popper,
  Grow,
  MenuList,
  alpha,
} from '@mui/material';
import {
  School as SchoolIcon,
  Home as HomeIcon,
  Upload as UploadIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  AccountCircle as AccountCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import useDebounce from '../hooks/useDebounce';
import { allSearchableSubjects } from '../data/universities';
import type { SearchableSubject } from '../types';
import supabase from '../lib/supabase';

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  // State management
  const [displayName, setDisplayName] = useState('');
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableSubject[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Effects
  useEffect(() => {
    const fetchUserDisplayName = async () => {
      if (user && user.email) {
        console.log('Fetching display name for user:', user.email);
        let name = '';

        // First try to fetch from profiles table
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('full_name, role, university_id, course_id')
            .eq('email', user.email)
            .single();
          
          console.log('Profile data from Supabase:', profileData);
          console.log('Profile fetch error:', error);
          
          if (profileData && profileData.full_name && profileData.full_name.trim()) {
            name = profileData.full_name.trim();
            console.log('Using full name from profile:', name);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }

        // If no name found in profiles, try auth metadata
        if (!name) {
          const metadataName = user.user_metadata?.full_name || 
                user.user_metadata?.name || 
                user.user_metadata?.display_name ||
                user.identities?.[0]?.identity_data?.full_name ||
                user.identities?.[0]?.identity_data?.name;
          
          if (metadataName && metadataName.trim()) {
            name = metadataName.trim();
            console.log('Using name from auth metadata:', name);
          }
        }

        // Use email prefix as final fallback
        if (!name) {
          name = user.email.split('@')[0];
          console.log('Using email prefix as fallback:', name);
        }

        console.log('Final display name set to:', name);
        setDisplayName(name);
      } else {
        setDisplayName('');
      }
    };

    fetchUserDisplayName();
  }, [user, profileRefreshKey]);

  // Listen for profile updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      console.log('Profile update detected, refreshing display name');
      setProfileRefreshKey(prev => prev + 1);
    };

    // Listen for custom profile update events
    window.addEventListener('profileUpdated', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleStorageUpdate);
    };
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery) {
      const lowerCaseQuery = debouncedSearchQuery.toLowerCase();
      const filteredResults = allSearchableSubjects.filter(subject =>
        subject.subjectName.toLowerCase().includes(lowerCaseQuery) ||
        subject.universityName.toLowerCase().includes(lowerCaseQuery) ||
        subject.courseName.toLowerCase().includes(lowerCaseQuery)
      );
      setSearchResults(filteredResults.slice(0, 8)); // Limit results
      setSearchOpen(true);
    } else {
      setSearchResults([]);
      setSearchOpen(false);
    }
  }, [debouncedSearchQuery]);

  // Handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    // Refresh profile data when menu is opened
    setProfileRefreshKey(prev => prev + 1);
    setAnchorElUser(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate('/');
  };

  const handleSearchResultClick = (result: SearchableSubject) => {
    const url = `/university/${result.universityId}/course/${result.courseId}/semester/${result.semester}/${result.subjectName.replace(/ /g, '-').toLowerCase()}`;
    navigate(url);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleDarkModeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const originPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    toggleDarkMode(originPosition);
  };

  const getFirstName = (fullName: string) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  // Navigation items
  const navigationItems = [
    { label: 'Home', icon: HomeIcon, path: '/' },
    { label: 'About Us', icon: InfoIcon, path: '/about' },
    { label: 'Contact Us', icon: PhoneIcon, path: '/contact' },
  ];

  const userMenuItems = user ? [
    { label: 'Profile', icon: PersonIcon, path: '/profile' },
    { label: 'Upload', icon: UploadIcon, path: '/upload' },
    { label: 'Logout', icon: LogoutIcon, action: handleLogout },
  ] : [
    { label: 'Login', icon: LoginIcon, path: '/login' },
  ];

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SchoolIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            EduPapers
          </Typography>
        </Box>
        
        {/* Mobile Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </Box>

      <Divider />

      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{ mx: 1, borderRadius: 1 }}
            >
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Dark Mode Toggle */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={(e) => {
              handleDarkModeToggle(e as any);
              setMobileOpen(false);
            }}
            sx={{ 
              mx: 1, 
              borderRadius: 1,
              backgroundColor: isDarkMode 
                ? alpha(theme.palette.warning.main, 0.1)
                : alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: isDarkMode
                  ? alpha(theme.palette.warning.main, 0.2)
                  : alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <ListItemIcon>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText primary={isDarkMode ? 'Light Mode' : 'Dark Mode'} />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      <List>
        {userMenuItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={() => {
                setMobileOpen(false);
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              sx={{ mx: 1, borderRadius: 1 }}
            >
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {user && (
        <>
          <Divider sx={{ mt: 2 }} />
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={user.user_metadata?.avatar_url}
              sx={{ width: 40, height: 40 }}
            >
              {(displayName || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {displayName || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(30, 41, 59, 0.95)' // Dark mode: slate-800 with opacity
            : 'rgba(255, 255, 255, 0.95)', // Light mode: white with opacity
          backdropFilter: 'blur(8px)',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box 
            component={Link}
            to="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { opacity: 0.8 }
            }}
          >
            <SchoolIcon sx={{ color: 'primary.main', fontSize: { xs: 28, md: 32 } }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: 'primary.main',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              EduPapers
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <Box sx={{ display: 'flex', gap: 1, mr: 3 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    startIcon={<item.icon />}
                    sx={{ 
                      color: 'text.primary',
                      '&:hover': { 
                        backgroundColor: alpha(theme.palette.primary.main, 0.08) 
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>

              {/* Dark Mode Toggle */}
              <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                <IconButton
                  onClick={handleDarkModeToggle}
                  sx={{ 
                    mr: 2,
                    color: 'text.primary',
                    backgroundColor: isDarkMode 
                      ? alpha(theme.palette.warning.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { 
                      backgroundColor: isDarkMode
                        ? alpha(theme.palette.warning.main, 0.2)
                        : alpha(theme.palette.primary.main, 0.2),
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              {/* Desktop Search */}
              <Box sx={{ position: 'relative', mr: 2 }} ref={searchRef}>
                <TextField
                  size="small"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    width: 320,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.paper, 0.8)
                        : alpha(theme.palette.common.white, 0.8),
                    }
                  }}
                />

                {/* Search Results Dropdown */}
                <Popper
                  open={searchOpen && searchResults.length > 0}
                  anchorEl={searchRef.current}
                  placement="bottom-start"
                  transition
                  style={{ zIndex: 1300, width: 320 }}
                >
                  {({ TransitionProps }) => (
                    <Grow {...TransitionProps}>
                      <Paper 
                        elevation={8}
                        sx={{ 
                          mt: 1, 
                          maxHeight: 400, 
                          overflow: 'auto',
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
                          <MenuList dense>
                            {searchResults.map((result, index) => (
                              <MenuItem
                                key={index}
                                onClick={() => handleSearchResultClick(result)}
                                sx={{ 
                                  flexDirection: 'column', 
                                  alignItems: 'flex-start',
                                  py: 1.5
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {result.subjectName}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                  <Chip 
                                    label={result.universityName} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                  />
                                  <Chip 
                                    label={result.courseName} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                  />
                                  <Chip 
                                    label={`Sem ${result.semester}`} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                  />
                                </Box>
                              </MenuItem>
                            ))}
                            {searchQuery && searchResults.length === 0 && (
                              <MenuItem disabled>
                                <Typography color="text.secondary">
                                  No results found
                                </Typography>
                              </MenuItem>
                            )}
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </Box>
            </>
          )}

          {/* User Menu */}
          {user ? (
            <Box>
              <Tooltip title="Account settings">
                <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                  <Avatar 
                    src={user.user_metadata?.avatar_url}
                    sx={{ width: 40, height: 40 }}
                  >
                    {(displayName || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleUserMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {displayName || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                
                {userMenuItems.slice(0, -1).map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={() => {
                      handleUserMenuClose();
                      if (item.path) navigate(item.path);
                    }}
                  >
                    <ListItemIcon>
                      <item.icon fontSize="small" />
                    </ListItemIcon>
                    {item.label}
                  </MenuItem>
                ))}
                
                <Divider />
                
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              component={Link}
              to="/login"
              variant="contained"
              startIcon={<LoginIcon />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: { 
            backgroundColor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
            color: 'text.primary',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        {drawer}
      </Drawer>
    </>
  );
}
