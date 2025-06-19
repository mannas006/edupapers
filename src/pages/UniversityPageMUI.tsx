import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Breadcrumbs,
  Link,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Stack,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  School,
  Class,
  ArrowForward,
  Home,
  Schedule
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { universities } from '../data/universities';
import type { University } from '../types';

interface CourseCardProps {
  course: {
    id: string;
    name: string;
    semesters: number;
  };
  universityId: string;
  index: number;
  onCourseClick: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, universityId, index, onCourseClick }) => {
  const theme = useTheme();

  return (
    <Zoom in={true} style={{ transitionDelay: `${index * 150}ms` }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.shadows[12],
            '& .course-action-btn': {
              backgroundColor: 'primary.main',
              color: 'white',
            }
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
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.3s ease-in-out',
          },
          '&:hover::before': {
            transform: 'scaleX(1)',
          }
        }}
        onClick={() => onCourseClick(course.id)}
      >
        <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <Class sx={{ fontSize: 32, color: 'primary.main' }} />
            </Avatar>
          </Box>
          
          <Typography
            variant="h5"
            component="h3"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: 2,
              minHeight: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {course.name}
          </Typography>
          
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Chip
              label={`${course.semesters} Semesters`}
              size="small"
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: 'primary.main',
                fontWeight: 500,
              }}
            />
          </Stack>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            className="course-action-btn"
            variant="outlined"
            endIcon={<ArrowForward />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              transition: 'all 0.3s ease-in-out',
            }}
          >
            View Subjects
          </Button>
        </CardActions>
      </Card>
    </Zoom>
  );
};

export default function UniversityPageMUI() {
  const { universityId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const university = universities.find((uni) => uni.id === universityId);

  if (!university) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Fade in={true}>
          <Box>
            <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              University Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              The university you're looking for doesn't exist or has been removed.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
            >
              Go Back Home
            </Button>
          </Box>
        </Fade>
      </Container>
    );
  }

  const handleCourseClick = (courseId: string) => {
    navigate(`/university/${universityId}/course/${courseId}`);
  };

  return (
    <Box sx={{ minHeight: '80vh', backgroundColor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Fade in={true} timeout={600}>
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                component={RouterLink}
                to="/"
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                Home
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <School sx={{ mr: 0.5 }} fontSize="inherit" />
                {university.shortName || university.name}
              </Typography>
            </Breadcrumbs>
          </Box>
        </Fade>

        {/* Back Button */}
        <Fade in={true} timeout={800}>
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              Back
            </Button>
          </Box>
        </Fade>

        {/* University Header */}
        <Fade in={true} timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
              <Avatar
                src={university.logo}
                sx={{
                  width: 80,
                  height: 80,
                  border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <School sx={{ fontSize: 40, color: 'primary.main' }} />
              </Avatar>
              
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  {university.name}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {university.courses.length} courses available
                </Typography>
              </Box>
            </Stack>
            
            <Divider sx={{ mt: 3, opacity: 0.3 }} />
          </Box>
        </Fade>

        {/* Courses Grid */}
        <Fade in={true} timeout={1200}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Available Courses
            </Typography>
            
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)'
                },
                gap: { xs: 2, sm: 3, md: 4 }
              }}
            >
              {university.courses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  universityId={universityId!}
                  index={index}
                  onCourseClick={handleCourseClick}
                />
              ))}
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
