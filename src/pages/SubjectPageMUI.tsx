import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  IconButton,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  alpha,
  useTheme,
  Fade,
  Zoom
} from '@mui/material';
import {
  ArrowBack,
  School,
  MenuBook,
  Assignment,
  NavigateNext
} from '@mui/icons-material';
import { universities } from '../data/universities';
import type { Course, University } from '../types';

export default function SubjectPageMUI() {
  const { universityId, courseId, semester } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const university = universities.find((uni) => uni.id === universityId);
  const course = university?.courses.find((c) => c.id === courseId);
  const semesterNumber = parseInt(semester || '0', 10);

  if (!university || !course || !semesterNumber || !course.subjects || !course.subjects[semesterNumber]) {
    return (
      <Container sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Subjects not found
        </Typography>
      </Container>
    );
  }

  const subjects = course.subjects[semesterNumber];

  const handleSubjectClick = (subject: any) => {
    navigate(`/university/${universityId}/course/${courseId}/semester/${semester}/${subject.question.replace(/ /g, '-').toLowerCase()}`);
  };

  return (
    <Box sx={{ 
      minHeight: '80vh', 
      backgroundColor: 'background.default',
      backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Back Button and Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ 
              mb: 2,
              color: 'text.secondary',
              '&:hover': { 
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main'
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          
          <Breadcrumbs 
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 2 }}
          >
            <Link 
              color="inherit" 
              onClick={() => navigate('/')} 
              sx={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                '&:hover': { color: 'primary.main' }
              }}
            >
              <School sx={{ mr: 0.5, fontSize: '1rem' }} />
              Universities
            </Link>
            <Link 
              color="inherit" 
              onClick={() => navigate(`/university/${universityId}`)}
              sx={{ 
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {university.name}
            </Link>
            <Link 
              color="inherit" 
              onClick={() => navigate(`/university/${universityId}/course/${courseId}`)}
              sx={{ 
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {course.name}
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <MenuBook sx={{ mr: 0.5, fontSize: '1rem' }} />
              Semester {semesterNumber}
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Header Section */}
        <Fade in={true} timeout={600}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4, 
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.3
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                {course.name}
              </Typography>
              <Typography variant="h5" sx={{ opacity: 0.9, mb: 2 }}>
                {university.name}
              </Typography>
              <Chip
                icon={<Assignment />}
                label={`Semester ${semesterNumber} • ${subjects.length} Subjects`}
                sx={{
                  backgroundColor: alpha('#fff', 0.2),
                  color: 'white',
                  fontWeight: 'medium',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            </Box>
          </Paper>
        </Fade>

        {/* Subjects Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3
          }}
        >
          {subjects.map((subject, index) => (
            <Zoom in={true} timeout={600} style={{ transitionDelay: `${index * 100}ms` }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                    '& .subject-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                      color: 'primary.main'
                    },
                    '& .subject-title': {
                      color: 'primary.main'
                    }
                  }
                }}
              >
                <CardActionArea
                  onClick={() => handleSubjectClick(subject)}
                  sx={{ height: '100%', p: 0 }}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Box
                      className="subject-icon"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <MenuBook sx={{ fontSize: 28, color: 'text.secondary' }} />
                    </Box>
                    
                    <Typography
                      variant="h6"
                      component="h3"
                      className="subject-title"
                      sx={{
                        fontWeight: 600,
                        lineHeight: 1.3,
                        transition: 'color 0.3s ease',
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      {subject.question}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Zoom>
          ))}
        </Box>

        {/* Empty State */}
        {subjects.length === 0 && (
          <Fade in={true} timeout={800}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 4
              }}
            >
              <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No subjects available
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Subjects for this semester will be added soon.
              </Typography>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
}
