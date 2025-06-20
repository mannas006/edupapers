import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Fade,
  Slide,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Login as LoginIcon,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  School,
  Person
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

// Styled Components
const GradientPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(2),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1.1rem',
  boxShadow: theme.shadows[4],
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
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

export default function LoginMUI() {
  const navigate = useNavigate();
  const { signInWithEmail, user, loading } = useAuth();
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      setEmailError(validateEmail(value));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      return;
    }

    setAuthError(null);
    setIsSubmitting(true);

    try {
      await signInWithEmail(email, password);
      toast.success('Welcome back!');
    } catch (error: any) {
      setAuthError(error.message || 'Invalid email or password');
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        py: 4
      }}
    >
      <Toaster position="top-center" />
      
      <Container maxWidth="sm">
        <Slide direction="up" in={true} mountOnEnter unmountOnExit timeout={800}>
          <Box>
            {/* Header */}
            <Fade in={true} timeout={1000}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <School 
                    sx={{ 
                      fontSize: 48, 
                      color: 'primary.main',
                      mr: 1
                    }} 
                  />
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    EduPapers
                  </Typography>
                </Box>
                <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 400 }}>
                  Sign in to your account
                </Typography>
              </Box>
            </Fade>

            <Fade in={true} timeout={1200}>
              <GradientPaper elevation={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  <LoginIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                  <Typography variant="h5" fontWeight={600}>
                    Welcome Back
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3, opacity: 0.3 }} />

                {authError && (
                  <Fade in={true}>
                    <Alert 
                      severity="error" 
                      sx={{ mb: 3, borderRadius: 2 }}
                      onClose={() => setAuthError(null)}
                    >
                      {authError}
                    </Alert>
                  </Fade>
                )}

                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <StyledTextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      error={!!emailError}
                      helperText={emailError}
                      autoComplete="username"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color={emailError ? "error" : "primary"} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <StyledTextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      error={!!passwordError}
                      helperText={passwordError}
                      autoComplete="current-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color={passwordError ? "error" : "primary"} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <GradientButton
                      type="submit"
                      fullWidth
                      size="large"
                      disabled={isSubmitting}
                      startIcon={
                        isSubmitting ? 
                        <CircularProgress size={20} color="inherit" /> : 
                        <Person />
                      }
                      sx={{ mt: 2, py: 1.5 }}
                    >
                      {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </GradientButton>
                  </Stack>
                </form>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Button
                      variant="text"
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      Contact Admin
                    </Button>
                  </Typography>
                </Box>
              </GradientPaper>
            </Fade>
          </Box>
        </Slide>
      </Container>
    </Box>
  );
}
