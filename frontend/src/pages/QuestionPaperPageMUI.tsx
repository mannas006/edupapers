import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  Skeleton,
  Fade,
  Slide,
  alpha,
  useTheme,
  Divider,
  Stack,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Edit as EditIcon,
  School,
  MenuBook,
  Assignment,
  NavigateNext,
  QuestionAnswer,
  CalendarToday,
  Code,
  Person
} from '@mui/icons-material';
import { universities } from '../data/universities';
import QuestionEditor from '../components/QuestionEditor';
import toast, { Toaster } from 'react-hot-toast';
import supabase from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function QuestionPaperPageMUI() {
  const { universityId, courseId, semester, subjectName } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [questions, setQuestions] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUniversityId, setUserUniversityId] = useState<string | null>(null);
  const [userCourseId, setUserCourseId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const lastFetchParamsRef = useRef<string>('');

  const formattedSubjectName = subjectName?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const university = universities.find((uni) => uni.id === universityId);
  const course = university?.courses.find((c) => c.id === courseId);
  const semesterNumber = parseInt(semester || '0', 10);

  // Reset dataLoaded flag when route parameters change
  useEffect(() => {
    const currentParams = `${universityId}-${courseId}-${semester}-${subjectName}`;
    if (lastFetchParamsRef.current !== currentParams) {
      setDataLoaded(false);
      lastFetchParamsRef.current = currentParams;
    }
  }, [universityId, courseId, semester, subjectName]);

  // Add page visibility handling to prevent unnecessary fetches
  useEffect(() => {
    let isComponentMounted = true;

    const handleVisibilityChange = () => {
      // Only fetch if page becomes visible and data hasn't been loaded
      if (!document.hidden && !dataLoaded && isComponentMounted) {
        // Small delay to ensure smooth transitions
        setTimeout(() => {
          if (isComponentMounted && !dataLoaded) {
            const currentParams = `${universityId}-${courseId}-${semester}-${subjectName}`;
            if (lastFetchParamsRef.current === currentParams) {
              return; // Prevent duplicate fetch
            }
            fetchQuestions();
          }
        }, 100);
      }
    };

    // Add event listener for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      isComponentMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dataLoaded, universityId, courseId, semester, subjectName]);

  const fetchQuestions = async () => {
    const currentParams = `${universityId}-${courseId}-${semester}-${subjectName}`;
    
    // Prevent duplicate fetches for the same parameters
    if (dataLoaded && lastFetchParamsRef.current === currentParams) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('university_id', universityId)
        .eq('course_id', courseId)
        .eq('semester', semester)
        .eq('subject_name', subjectName);

      if (error) {
        console.error('Failed to fetch questions:', error);
        toast.error('Failed to load questions.');
      } else if (data && data.length > 0) {
        setQuestions(data[0].content || '');
      } else {
        setQuestions('');
      }

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, university_id, course_id')
          .eq('email', user.email)
          .single();

        if (profileError) {
          console.error('Error fetching profile data:', profileError);
          // Reduced error visibility for better UX
          setUserRole(null);
          setUserUniversityId(null);
          setUserCourseId(null);
        } else {
          setUserRole(profileData?.role || null);
          setUserUniversityId(profileData?.university_id || null);
          setUserCourseId(profileData?.course_id || null);
        }
      } else {
        setUserRole(null);
        setUserUniversityId(null);
        setUserCourseId(null);
      }
      
      setDataLoaded(true);
      lastFetchParamsRef.current = currentParams;
    } catch (error) {
      console.error('Error in fetchQuestions:', error);
      toast.error('An error occurred while loading questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if data hasn't been loaded for current parameters
    if (!dataLoaded) {
      fetchQuestions();
    }
  }, [dataLoaded]);

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
  const subject = subjects.find(sub => sub.question.replace(/ /g, '-').toLowerCase() === subjectName);

  if (!subject) {
    return (
      <Container sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Question paper not found
        </Typography>
      </Container>
    );
  }

  const canEdit = () => {
    if (!userRole) return false;
    if (userRole === 'admin') return true;
    if (userRole === 'pro' && String(userUniversityId) === String(universityId)) return true;
    if (userRole === 'gold') {
      return String(userUniversityId) === String(universityId) && String(userCourseId) === String(courseId);
    }
    return false;
  };

  const handleSaveQuestions = async (content: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('questions')
        .upsert(
          {
            university_id: universityId,
            course_id: courseId,
            semester,
            subject_name: subjectName,
            content,
          },
          { onConflict: 'university_id,course_id,semester,subject_name' }
        );

      if (error) {
        console.error('Failed to save question:', error);
        toast.error('Failed to save question.');
      } else {
        setQuestions(content);
        toast.success('Question saved successfully!');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('An unexpected error occurred while saving question.');
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'error';
      case 'pro': return 'warning';
      case 'gold': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '80vh', 
      backgroundColor: 'background.default',
      backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
    }}>
      <Toaster position="top-center" />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          {/* Back Button and Edit Button */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main'
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            
            {canEdit() && (
              <Tooltip title={`Edit as ${userRole?.toUpperCase()} user`}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Edit Questions
                </Button>
              </Tooltip>
            )}
          </Stack>
          
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 3 }}
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
            <Link 
              color="inherit" 
              onClick={() => navigate(`/university/${universityId}/course/${courseId}/semester/${semester}`)}
              sx={{ 
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Semester {semesterNumber}
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <QuestionAnswer sx={{ mr: 0.5, fontSize: '1rem' }} />
              {formattedSubjectName}
            </Typography>
          </Breadcrumbs>

          {/* Header Card */}
          <Fade in={true} timeout={600}>
            <Card 
              elevation={0}
              sx={{ 
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
              <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                  {formattedSubjectName} Questions
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                  <Chip
                    icon={<School />}
                    label={university.name}
                    sx={{
                      backgroundColor: alpha('#fff', 0.2),
                      color: 'white',
                      fontWeight: 'medium',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                  <Chip
                    icon={<MenuBook />}
                    label={course.name}
                    sx={{
                      backgroundColor: alpha('#fff', 0.2),
                      color: 'white',
                      fontWeight: 'medium',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                  <Chip
                    icon={<Assignment />}
                    label={`Semester ${semesterNumber}`}
                    sx={{
                      backgroundColor: alpha('#fff', 0.2),
                      color: 'white',
                      fontWeight: 'medium',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                  {user && userRole && (
                    <Chip
                      icon={<Person />}
                      label={userRole.toUpperCase()}
                      color={getRoleColor(userRole)}
                      sx={{
                        backgroundColor: alpha('#fff', 0.2),
                        color: 'white',
                        fontWeight: 'medium',
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        </Box>

        {/* Content Section */}
        <Slide direction="up" in={true} timeout={800}>
          <Card 
            elevation={2}
            sx={{ 
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 1)})`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              minHeight: '60vh'
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              {loading ? (
                <Box>
                  <Skeleton variant="text" width="60%" height={40} />
                  <Skeleton variant="text" width="80%" height={30} />
                  <Skeleton variant="text" width="70%" height={30} />
                  <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2, borderRadius: 2 }} />
                  <Skeleton variant="text" width="90%" height={30} sx={{ mt: 2 }} />
                  <Skeleton variant="text" width="85%" height={30} />
                </Box>
              ) : isEditing ? (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Edit Questions
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <QuestionEditor
                    initialContent={questions}
                    onSave={handleSaveQuestions}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <QuestionAnswer sx={{ mr: 1, color: 'primary.main' }} />
                    Exam Preparation Guide
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {questions ? (
                    <Box 
                      sx={{ 
                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                          color: 'text.primary',
                          fontWeight: 600,
                          mt: 3,
                          mb: 2
                        },
                        '& p': {
                          color: 'text.secondary',
                          lineHeight: 1.7,
                          mb: 2
                        },
                        '& ul, & ol': {
                          pl: 3,
                          '& li': {
                            color: 'text.secondary',
                            mb: 1
                          }
                        },
                        '& strong': {
                          color: 'text.primary',
                          fontWeight: 600
                        },
                        '& code': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontFamily: 'monospace'
                        },
                        '& pre': {
                          backgroundColor: alpha(theme.palette.grey[900], 0.05),
                          p: 2,
                          borderRadius: 2,
                          overflow: 'auto',
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                        }
                      }}
                      dangerouslySetInnerHTML={{ __html: questions }} 
                    />
                  ) : (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        backgroundColor: alpha(theme.palette.info.main, 0.05),
                        border: `2px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                        borderRadius: 3
                      }}
                    >
                      <QuestionAnswer sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Questions Available
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Sample questions for this subject haven't been added yet.
                      </Typography>
                      {canEdit() && (
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => setIsEditing(true)}
                          sx={{ mt: 2, borderRadius: 2 }}
                        >
                          Add Questions
                        </Button>
                      )}
                    </Paper>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Slide>
      </Container>
    </Box>
  );
}
