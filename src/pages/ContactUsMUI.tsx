import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Stack,
  Fade,
  Slide,
  useTheme,
  alpha,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import {
  ContactMail,
  Phone,
  LocationOn,
  Language,
  Send,
  Email,
  Person,
  Message,
  CheckCircle
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useForm, ValidationError } from '@formspree/react';

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

const contactInfo = [
  {
    icon: <LocationOn />,
    title: 'Address',
    detail: 'Kolkata, West Bengal, India',
    color: '#f44336'
  },
  {
    icon: <Phone />,
    title: 'Phone',
    detail: '+91 XXXXX XXXXX',
    color: '#4caf50'
  },
  {
    icon: <Email />,
    title: 'Email',
    detail: 'contact@edupapers.com',
    color: '#2196f3'
  },
  {
    icon: <Language />,
    title: 'Website',
    detail: 'www.edupapers.com',
    color: '#ff9800'
  }
];

function ContactForm() {
  const [state, handleSubmit] = useForm("mnnjvgny");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(e);
    if (state.succeeded) {
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  if (state.succeeded) {
    return (
      <Fade in={true}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Thank You!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your message has been sent successfully. We'll get back to you soon!
          </Typography>
        </Card>
      </Fade>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Send us a Message
        </Typography>
        <Divider sx={{ mb: 3, opacity: 0.3 }} />
        
        <form onSubmit={onSubmit}>
          <Stack spacing={3}>
            <StyledTextField
              fullWidth
              label="Your Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'primary.main' }} />
              }}
            />
            <ValidationError prefix="Name" field="name" errors={state.errors} />

            <StyledTextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'primary.main' }} />
              }}
            />
            <ValidationError prefix="Email" field="email" errors={state.errors} />

            <StyledTextField
              fullWidth
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: <Message sx={{ mr: 1, color: 'primary.main' }} />
              }}
            />
            <ValidationError prefix="Subject" field="subject" errors={state.errors} />

            <StyledTextField
              fullWidth
              label="Message"
              name="message"
              multiline
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              required
              placeholder="Tell us how we can help you..."
            />
            <ValidationError prefix="Message" field="message" errors={state.errors} />

            {state.errors && Object.keys(state.errors).length > 0 && (
              <Alert severity="error">
                There was an error sending your message. Please try again.
              </Alert>
            )}

            <GradientButton
              type="submit"
              disabled={state.submitting}
              startIcon={<Send />}
              size="large"
            >
              {state.submitting ? 'Sending...' : 'Send Message'}
            </GradientButton>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ContactUsMUI() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '80vh', backgroundColor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Fade in={true} timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <ContactMail 
                sx={{ 
                  fontSize: 48, 
                  color: 'primary.main',
                  mr: 2
                }} 
              />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Contact Us
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary">
              We'd love to hear from you. Get in touch with us!
            </Typography>
          </Box>
        </Fade>

        {/* Contact Info Cards */}
        <Fade in={true} timeout={1000}>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 3,
              mb: 6
            }}
          >
            {contactInfo.map((info, index) => (
              <Slide key={index} direction="up" in={true} timeout={1000 + index * 200}>
                <Card
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[8],
                    },
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      backgroundColor: info.color,
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.3s ease-in-out',
                    },
                    '&:hover::before': {
                      transform: 'scaleX(1)',
                    }
                  }}
                >
                  <IconButton
                    sx={{
                      bgcolor: alpha(info.color, 0.1),
                      color: info.color,
                      mb: 2,
                      '&:hover': {
                        bgcolor: alpha(info.color, 0.2),
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    {info.icon}
                  </IconButton>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {info.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {info.detail}
                  </Typography>
                </Card>
              </Slide>
            ))}
          </Box>
        </Fade>

        {/* Contact Form and Info */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4
          }}
        >
          {/* Contact Form */}
          <Slide direction="left" in={true} timeout={1200}>
            <Box>
              <ContactForm />
            </Box>
          </Slide>

          {/* Additional Info */}
          <Slide direction="right" in={true} timeout={1400}>
            <Card sx={{ p: 3, height: 'fit-content' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Get in Touch
                </Typography>
                <Divider sx={{ mb: 3, opacity: 0.3 }} />
                
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
                  Have a question about EduPapers? Need help finding specific question papers? 
                  Want to contribute to our platform? We're here to help!
                </Typography>
                
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
                  Our team typically responds within 24 hours. For urgent matters, 
                  please don't hesitate to reach out through multiple channels.
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    What we can help with:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {['Technical Support', 'Content Requests', 'Partnership Inquiries', 'Feedback'].map((item) => (
                      <Chip 
                        key={item}
                        label={item} 
                        variant="outlined" 
                        size="small"
                        sx={{
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          color: 'primary.main',
                          fontWeight: 500,
                          mb: 1
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Box>
      </Container>
    </Box>
  );
}
