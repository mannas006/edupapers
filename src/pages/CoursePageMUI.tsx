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
  Breadcrumbs,
  Link,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Stack,
  Divider,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  School,
  Class,
  ArrowForward,
  Home,
  Schedule,
  CalendarMonth
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { universities } from '../data/universities';
import type { Course, University } from '../types';

interface SemesterCardProps {
  semester: number;
  universityId: string;
  courseId: string;
  index: number;
  onSemesterClick: (semester: number) => void;
}

const SemesterCard: React.FC<SemesterCardProps> = ({ 
  semester, 
  universityId, 
  courseId, 
  index, 
  onSemesterClick 
}) => {
  const theme = useTheme();

  return (
    <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
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
            '& .semester-action-btn': {
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
        onClick={() => onSemesterClick(semester)}
      >
        <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <CalendarMonth sx={{ fontSize: 32, color: 'secondary.main' }} />
            </Avatar>
          </Box>
          
          <Typography
            variant="h4"
            component="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Semester {semester}
          </Typography>
          
          <Chip
            icon={<Schedule />}
            label="View Subjects"
            variant="outlined"
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.3),
              color: 'primary.main',
              fontWeight: 500,
            }}
          />
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            className="semester-action-btn"
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
            Browse Papers
          </Button>
        </CardActions>
      </Card>
    </Zoom>
  );
};

export default function CoursePageMUI() {
  const { universityId, courseId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const university = universities.find((uni) => uni.id === universityId);
  const course = university?.courses.find((c) => c.id === courseId);

  if (!university || !course) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Fade in={true}>
          <Box>
            <Class sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Course Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              The course you're looking for doesn't exist or has been removed.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Box>
        </Fade>
      </Container>
    );
  }

  const handleSemesterClick = (semester: number) => {
    navigate(`/university/${universityId}/course/${courseId}/semester/${semester}`);
  };

  const semesters = Array.from({ length: course.semesters }, (_, i) => i + 1);

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
              <Link
                component={RouterLink}
                to={`/university/${universityId}`}
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <School sx={{ mr: 0.5 }} fontSize="inherit" />
                {university.shortName || university.name}
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <Class sx={{ mr: 0.5 }} fontSize="inherit" />
                {course.name}
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

        {/* Course Header */}
        <Fade in={true} timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Class sx={{ fontSize: 40, color: 'primary.main' }} />
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
                  {course.name}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {university.name}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  <Chip
                    icon={<Schedule />}
                    label={`${course.semesters} Semesters`}
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
            </Stack>
            
            <Divider sx={{ mt: 3, opacity: 0.3 }} />
          </Box>
        </Fade>

        {/* Semesters Grid */}
        <Fade in={true} timeout={1200}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Choose Semester
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
              {semesters.map((semester, index) => (
                <SemesterCard
                  key={semester}
                  semester={semester}
                  universityId={universityId!}
                  courseId={courseId!}
                  index={index}
                  onSemesterClick={handleSemesterClick}
                />
              ))}
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
