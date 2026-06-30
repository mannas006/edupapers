import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Fade,
  useTheme,
  Divider
} from '@mui/material';
import {
  School
} from '@mui/icons-material';

export default function AboutUsMUI() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '80vh', backgroundColor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Fade in={true} timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <School 
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
                About Us
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary">
              Empowering students through accessible educational resources
            </Typography>
          </Box>
        </Fade>

        {/* Our Story */}
        <Fade in={true} timeout={1000}>
          <Card sx={{ mb: 4, p: 2 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Our Story
              </Typography>
              <Divider sx={{ mb: 3, opacity: 0.3 }} />
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                EduPapers was founded with a simple yet powerful mission: to make quality educational 
                resources accessible to all students. We recognized the challenges students face in 
                preparing for exams, particularly the difficulty in finding reliable and relevant 
                past question papers.
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                Our journey began with a small team of educators and developers who shared a passion 
                for improving the learning experience. We set out to create a platform that not only 
                provides access to these valuable resources but also fosters a community of learners.
              </Typography>
            </CardContent>
          </Card>
        </Fade>

        {/* Our Mission */}
        <Fade in={true} timeout={1200}>
          <Card sx={{ mb: 6, p: 2 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Our Mission
              </Typography>
              <Divider sx={{ mb: 3, opacity: 0.3 }} />
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                Our mission is to empower students by providing them with the tools and resources 
                they need to succeed academically. We are committed to offering a comprehensive 
                collection of past question papers, making exam preparation more effective and 
                less stressful.
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                We strive to create a user-friendly platform that is accessible to all, regardless 
                of their background or location. We believe that education is a fundamental right, 
                and we are dedicated to supporting students in their pursuit of knowledge.
              </Typography>
            </CardContent>
          </Card>
        </Fade>

      </Container>
    </Box>
  );
}
