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
  Avatar,
  CircularProgress
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
  Person,
  CloudDownload,
  OpenInNew,
  CheckCircle,
  Cancel,
  HourglassEmpty
} from '@mui/icons-material';
import { universities } from '../data/universities';
import { makautPapers } from '../data/makaut_papers';
import QuestionEditor from '../components/QuestionEditor';
import toast, { Toaster } from 'react-hot-toast';
import { db } from '../lib/adapters';
import { useAuth } from '../contexts/AuthContext';
import { cleanSubjectName, getSubjectSlug } from '../utils/subjectUtils';

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
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [deletedStaticSlugs, setDeletedStaticSlugs] = useState<string[]>([]);
  const lastFetchParamsRef = useRef<string>('');

  const formattedSubjectName = subjectName?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const university = universities.find((uni) => uni.id === universityId);
  const course = university?.courses.find((c) => c.id === courseId);
  const semesterNumber = parseInt(semester || '0', 10);

  const subjectsList = course?.subjects?.[semesterNumber] || [];
  const staticSubject = subjectsList.find(sub => sub.question.replace(/ /g, '-').toLowerCase() === subjectName);

  const isCustom = customSubjects.includes(subjectName || '');

  // Find all papers matching this subject in the crawled database
  const crawledPapersForSubject = React.useMemo(() => {
    if (isCustom || !course) return [];
    const normalizedCourseName = course.name.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return makautPapers.filter(p => {
      const pCourse = p.course.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (pCourse !== normalizedCourseName || p.semester !== semesterNumber) return false;
      const pSlug = getSubjectSlug(p.course, p.semester, cleanSubjectName(p));
      return pSlug === subjectName?.toLowerCase();
    });
  }, [subjectName, course, semesterNumber, isCustom]);

  // Extract unique sorted years from the crawled papers, fallback to default years if none found
  const availableYears = React.useMemo(() => {
    if (crawledPapersForSubject.length === 0) {
      return ['2026', '2025', '2024', '2023', '2022'];
    }
    const years = Array.from(new Set(crawledPapersForSubject.map(p => p.year)));
    return years.sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
  }, [crawledPapersForSubject]);

  // Look up subject details in the crawled database if not found statically
  const crawledSubjectInfo = React.useMemo(() => {
    if (staticSubject) return staticSubject;
    if (crawledPapersForSubject.length > 0) {
      const paper = crawledPapersForSubject[0];
      return {
        question: cleanSubjectName(paper),
        code: paper.code,
        type: 'Theory',
        year: paper.year
      };
    }
    return null;
  }, [staticSubject, crawledPapersForSubject]);

  const subject = staticSubject || crawledSubjectInfo;

  const [selectedYear, setSelectedYear] = useState('2026');
  const [checkingLink, setCheckingLink] = useState(false);
  const [linkExists, setLinkExists] = useState<boolean | null>(null);

  // Set default selected year when availableYears changes
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const getBackendBaseUrl = () => {
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:8000/webhook/process-pdf';
    try {
      const url = new URL(webhookUrl);
      return `${url.protocol}//${url.host}`;
    } catch (e) {
      return 'http://localhost:8000';
    }
  };

  const getMakautLink = (year: string) => {
    if (!subject) return '';
    
    // Look up directly in pre-filtered crawled papers first
    const paper = crawledPapersForSubject.find(p => p.year === year);
    if (paper) return paper.pdfUrl;
    
    // Fallback URL generator
    if (!course || !subject.code) return '';
    const courseSlug = course.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const subjectSlug = subject.question
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const codeSlug = subject.code.toLowerCase();
    return `https://www.makaut.com/papers/${courseSlug}-${semesterNumber}-sem-${subjectSlug}-${codeSlug}-${year}.pdf`;
  };

  const currentDownloadUrl = getMakautLink(selectedYear);

  useEffect(() => {
    if (!currentDownloadUrl) return;
    
    let active = true;
    const checkUrl = async () => {
      setCheckingLink(true);
      setLinkExists(null);
      try {
        const baseUrl = getBackendBaseUrl();
        const res = await fetch(`${baseUrl}/api/makaut/verify?url=${encodeURIComponent(currentDownloadUrl)}`);
        const data = await res.json();
        if (active) {
          setLinkExists(data.exists);
        }
      } catch (err) {
        console.error('Failed to verify paper link', err);
        if (active) {
          setLinkExists(null);
        }
      } finally {
        if (active) {
          setCheckingLink(false);
        }
      }
    };

    const timer = setTimeout(() => {
      checkUrl();
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [currentDownloadUrl]);

  const isMakaut = university?.shortName === 'MAKAUT' || university?.id === '8';

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
      const content = await db.getQuestions(
        universityId || '', 
        courseId || '', 
        semester || '', 
        subjectName || ''
      );
      setQuestions(content);

      try {
        const dbSubjects = await db.getSemesterSubjects(
          universityId || '',
          courseId || '',
          semester || ''
        );
        setCustomSubjects(dbSubjects.filter(name => name !== '__deleted_subjects__'));
      } catch (err) {
        console.error('Error fetching custom subjects in QuestionPaperPageMUI:', err);
      }

      try {
        const deletedData = await db.getQuestions(
          universityId || '',
          courseId || '',
          semester || '',
          '__deleted_subjects__'
        );
        if (deletedData) {
          try {
            setDeletedStaticSlugs(JSON.parse(deletedData));
          } catch (e) {
            console.error('Error parsing deleted static subjects:', e);
          }
        } else {
          setDeletedStaticSlugs([]);
        }
      } catch (err) {
        console.error('Error fetching deleted static subjects in QuestionPaperPageMUI:', err);
      }

      if (user && user.email) {
        const profileData = await db.getProfile(user.email);
        if (profileData) {
          setUserRole(profileData.role || null);
          setUserUniversityId(profileData.university_id || null);
          setUserCourseId(profileData.course_id || null);
        } else {
          setUserRole(null);
          setUserUniversityId(null);
          setUserCourseId(null);
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

  if (!university || !course || !semesterNumber || semesterNumber < 1 || semesterNumber > course.semesters) {
    return (
      <Container sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Subjects not found
        </Typography>
      </Container>
    );
  }

  const subjects = course.subjects?.[semesterNumber] || [];
  const isStatic = subjects.some(sub => sub.question.replace(/ /g, '-').toLowerCase() === subjectName);

  const canEdit = () => {
    if (!user) return false;
    if (isCustom) return true;
    if (!userRole) return false;
    if (userRole === 'admin') return true;
    if (userRole === 'pro' && String(userUniversityId) === String(universityId)) return true;
    if (userRole === 'gold') {
      return String(userUniversityId) === String(universityId) && String(userCourseId) === String(courseId);
    }
    return false;
  };

  const isDeletedStatic = deletedStaticSlugs.includes(subjectName || '');
  const isCrawled = !!crawledSubjectInfo;

  if ((isDeletedStatic || (!isStatic && !isCustom && !isCrawled)) && !loading) {
    return (
      <Container sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Question paper not found
        </Typography>
      </Container>
    );
  }

  const handleSaveQuestions = async (content: string) => {
    setLoading(true);
    try {
      await db.upsertQuestions(
        universityId || '',
        courseId || '',
        semester || '',
        subjectName || '',
        content
      );
      setQuestions(content);
      toast.success('Question saved successfully!');
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
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: alpha(theme.palette.divider, 0.15),
                color: 'text.secondary',
                px: 2,
                py: 0.75,
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  borderColor: theme.palette.primary.main,
                  color: 'primary.main'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Back
            </Button>
            
            {canEdit() && (
              <Tooltip title={`Edit as ${userRole?.toUpperCase()} user`}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: theme.palette.primary.main,
                    color: 'primary.main',
                    px: 2,
                    py: 0.75,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      borderColor: theme.palette.primary.main,
                    }
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

        {isMakaut && subject && (
          <Fade in={true} timeout={800}>
            <Card
              sx={{
                mb: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 1)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
                }
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CloudDownload color="primary" />
                      Download Original Question Paper
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Access the official MAKAUT exam papers archive directly from our integrated repository links.
                    </Typography>

                    {subject.code ? (
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1.5 }}>
                        <Chip
                          icon={<Code fontSize="small" />}
                          label={`Subject Code: ${subject.code.toUpperCase()}`}
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: 1.5 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          Select Year:
                        </Typography>
                        {availableYears.map((year) => (
                          <Chip
                            key={year}
                            label={year}
                            onClick={() => setSelectedYear(year)}
                            color={selectedYear === year ? 'primary' : 'default'}
                            variant={selectedYear === year ? 'filled' : 'outlined'}
                            size="small"
                            sx={{ 
                              cursor: 'pointer',
                              fontWeight: selectedYear === year ? 600 : 400,
                              borderRadius: 1.5,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: selectedYear === year ? 'primary.main' : alpha(theme.palette.primary.main, 0.08)
                              }
                            }}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Chip
                        icon={<Cancel color="error" fontSize="small" />}
                        label="Subject Code Missing - Cannot Generate Download URL"
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ borderRadius: 1.5 }}
                      />
                    )}
                  </Box>

                  {subject.code && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'stretch', md: 'flex-end' }, gap: 1, minWidth: { md: 240 } }}>
                      {/* Status Indicator */}
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-end' }} sx={{ mb: 1 }}>
                        {checkingLink ? (
                          <>
                            <CircularProgress size={14} thickness={6} />
                            <Typography variant="caption" color="text.secondary">Verifying link...</Typography>
                          </>
                        ) : linkExists === true ? (
                          <>
                            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="caption" color="success.main" fontWeight="medium">Verified Available</Typography>
                          </>
                        ) : linkExists === false ? (
                          <>
                            <Cancel sx={{ fontSize: 16, color: 'warning.main' }} />
                            <Typography variant="caption" color="warning.main" fontWeight="medium">Not Found on makaut.com</Typography>
                          </>
                        ) : (
                          <>
                            <HourglassEmpty sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">Verification pending</Typography>
                          </>
                        )}
                      </Stack>

                      <Button
                        variant="contained"
                        color={linkExists === false ? 'warning' : 'primary'}
                        startIcon={<CloudDownload />}
                        endIcon={<OpenInNew />}
                        href={currentDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        disabled={!currentDownloadUrl}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.2,
                          px: 3,
                          boxShadow: theme.palette.mode === 'dark' 
                            ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                            : `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.palette.mode === 'dark'
                              ? `0 6px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                              : `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        Download PDF ({selectedYear})
                      </Button>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        )}

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
