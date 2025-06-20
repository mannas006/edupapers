import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  Stack,
  Fade,
  Slide,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  Person,
  Email,
  School,
  Class,
  Edit,
  Save,
  Cancel,
  AccountCircle
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(2),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1.1rem',
  boxShadow: theme.shadows[4],
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[2],
    },
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  }
}));

export default function ProfileMUI() {
  const { user, loading, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      if (user) {
        setEmail(user.email || '');

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, role, university_id, course_id')
            .eq('email', user.email)
            .single();

          if (error) {
            console.error('Error fetching profile data:', error);
            toast.error('Failed to load profile data.');
          } else if (data) {
            setFullName(data.full_name || '');
            setRole(data.role || '');
            setUniversityId(data.university_id || '');
            setCourseId(data.course_id || '');
          }
        } catch (error) {
          console.error('Error in fetchProfileData:', error);
          toast.error('An error occurred while loading profile data.');
        }
      }
    };

    fetchProfileData();
  }, [user, loading, navigate]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          email: user.email,
          full_name: fullName,
          role: role,
          university_id: universityId,
          course_id: courseId,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Dispatch custom event to notify navbar of profile update
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset fields to original values if needed
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Fade in={true}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <AccountCircle sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Please Login
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You need to be logged in to view your profile.
            </Typography>
            <Button variant="contained" size="large" href="/login">
              Login
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '80vh', backgroundColor: 'background.default' }}>
      <Toaster position="top-right" />
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Box>
            {/* Header */}
            <Fade in={true} timeout={800}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2
                  }}
                >
                  My Profile
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Manage your account information
                </Typography>
              </Box>
            </Fade>

            <Fade in={true} timeout={1000}>
              <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {/* Profile Header */}
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    p: 4,
                    textAlign: 'center',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                      mx: 'auto',
                      mb: 2,
                      border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    {fullName ? fullName.charAt(0).toUpperCase() : <Person sx={{ fontSize: 48 }} />}
                  </Avatar>
                  <Typography variant="h4" fontWeight={600} gutterBottom>
                    {fullName || 'User'}
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Chip
                      label={role || 'Student'}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        color: 'primary.main',
                        fontWeight: 500,
                      }}
                    />
                  </Stack>
                </Box>

                <Box sx={{ p: 4 }}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <Stack spacing={3}>
                    <StyledTextField
                      fullWidth
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'primary.main' }} />
                      }}
                    />

                    <StyledTextField
                      fullWidth
                      label="Email Address"
                      value={email}
                      disabled
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'primary.main' }} />
                      }}
                    />

                    <StyledTextField
                      fullWidth
                      label="Role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g., Student, Faculty, Admin"
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'primary.main' }} />
                      }}
                    />

                    <StyledTextField
                      fullWidth
                      label="University ID"
                      value={universityId}
                      onChange={(e) => setUniversityId(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Your university identifier"
                      InputProps={{
                        startAdornment: <School sx={{ mr: 1, color: 'primary.main' }} />
                      }}
                    />

                    <StyledTextField
                      fullWidth
                      label="Course ID"
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Your course identifier"
                      InputProps={{
                        startAdornment: <Class sx={{ mr: 1, color: 'primary.main' }} />
                      }}
                    />

                    <Divider sx={{ my: 2 }} />

                    {/* Action Buttons */}
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={2} 
                      justifyContent="space-between"
                    >
                      {!isEditing ? (
                        <GradientButton
                          startIcon={<Edit />}
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </GradientButton>
                      ) : (
                        <Stack direction="row" spacing={2}>
                          <GradientButton
                            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                            onClick={handleSave}
                            disabled={isSaving}
                          >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </GradientButton>
                          <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={handleCancel}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      )}

                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Paper>
            </Fade>
          </Box>
        </Slide>
      </Container>
    </Box>
  );
}
