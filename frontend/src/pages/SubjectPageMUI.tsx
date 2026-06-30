import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  IconButton,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  alpha,
  useTheme,
  Fade,
  Zoom,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  School,
  MenuBook,
  Assignment,
  NavigateNext,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { universities } from '../data/universities';
import { makautPapers } from '../data/makaut_papers';
import { db } from '../lib/adapters';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { cleanSubjectName, getSubjectSlug } from '../utils/subjectUtils';

export default function SubjectPageMUI() {
  const { universityId, courseId, semester } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  const university = universities.find((uni) => uni.id === universityId);
  const course = university?.courses.find((c) => c.id === courseId);
  const semesterNumber = parseInt(semester || '0', 10);

  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [deletedStaticSlugs, setDeletedStaticSlugs] = useState<string[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Subject states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<{ question: string; slug: string } | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');

  // Delete Subject states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState<{ question: string; slug: string } | null>(null);

  const handleEditClick = (subject: any) => {
    setEditingSubject(subject);
    setEditSubjectName(subject.question);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (subject: any) => {
    setDeletingSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSubject = async () => {
    if (!editingSubject) return;
    if (!editSubjectName.trim()) {
      toast.error('Subject name cannot be empty');
      return;
    }

    const newSlug = editSubjectName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!newSlug) {
      toast.error('Invalid subject name');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Fetch content of old subject questions (if any)
      let content = "";
      try {
        content = await db.getQuestions(
          universityId || '',
          courseId || '',
          semester || '',
          editingSubject.slug
        );
      } catch (e) {
        console.log("No existing questions for old subject:", editingSubject.slug);
      }

      // 2. Upsert questions to new subject slug
      await db.upsertQuestions(
        universityId || '',
        courseId || '',
        semester || '',
        newSlug,
        content
      );

      // 3. Delete old subject questions (if slug changed)
      if (editingSubject.slug !== newSlug) {
        await db.deleteSubject(
          universityId || '',
          courseId || '',
          semester || '',
          editingSubject.slug
        );

        // 4. If old subject was static, add it to deletedStaticSlugs list
        const staticSlugsList = (course.subjects?.[semesterNumber] || []).map(
          sub => sub.question.replace(/ /g, '-').toLowerCase()
        );
        const isStaticOldSlug = staticSlugsList.includes(editingSubject.slug);
        if (isStaticOldSlug && !deletedStaticSlugs.includes(editingSubject.slug)) {
          const updatedDeleted = [...deletedStaticSlugs, editingSubject.slug];
          await db.upsertQuestions(
            universityId || '',
            courseId || '',
            semester || '',
            '__deleted_subjects__',
            JSON.stringify(updatedDeleted)
          );
        }
      }

      toast.success('Subject paper renamed successfully!');
      setIsEditDialogOpen(false);
      setEditingSubject(null);
      setEditSubjectName('');
      await fetchCustomSubjects();
    } catch (error) {
      console.error('Error renaming subject:', error);
      toast.error('Failed to rename subject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;

    setIsSubmitting(true);
    try {
      // 1. Delete questions from DB
      await db.deleteSubject(
        universityId || '',
        courseId || '',
        semester || '',
        deletingSubject.slug
      );

      // 2. If it was static subject, add it to deletedStaticSlugs list
      const staticSlugsList = (course.subjects?.[semesterNumber] || []).map(
        sub => sub.question.replace(/ /g, '-').toLowerCase()
      );
      const isStaticOldSlug = staticSlugsList.includes(deletingSubject.slug);
      if (isStaticOldSlug && !deletedStaticSlugs.includes(deletingSubject.slug)) {
        const updatedDeleted = [...deletedStaticSlugs, deletingSubject.slug];
        await db.upsertQuestions(
          universityId || '',
          courseId || '',
          semester || '',
          '__deleted_subjects__',
          JSON.stringify(updatedDeleted)
        );
      }

      toast.success('Subject paper deleted successfully!');
      setIsDeleteDialogOpen(false);
      setDeletingSubject(null);
      await fetchCustomSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchCustomSubjects = async () => {
    setLoadingCustom(true);
    try {
      const dbSubjects = await db.getSemesterSubjects(
        universityId || '',
        courseId || '',
        semester || ''
      );
      setCustomSubjects(dbSubjects.filter(name => name !== '__deleted_subjects__'));

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
    } catch (error) {
      console.error('Error fetching custom subjects:', error);
    } finally {
      setLoadingCustom(false);
    }
  };

  useEffect(() => {
    if (university && course && semesterNumber >= 1 && semesterNumber <= course.semesters) {
      fetchCustomSubjects();
    }
  }, [universityId, courseId, semester]);

  if (!university || !course || !semesterNumber || semesterNumber < 1 || semesterNumber > course.semesters) {
    return (
      <Container sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Subjects not found
        </Typography>
      </Container>
    );
  }

  const staticSubjects = course.subjects?.[semesterNumber] || [];
  
  // Filter static subjects to only include those not in deletedStaticSlugs
  const activeStaticSubjects = staticSubjects.filter(sub => {
    const slug = sub.question.replace(/ /g, '-').toLowerCase();
    return !deletedStaticSlugs.includes(slug);
  });

  // Format the static subjects' names into slugs for comparison
  const activeStaticSlugs = new Set(
    activeStaticSubjects.map(sub => sub.question.replace(/ /g, '-').toLowerCase())
  );

  // Map active static subjects to include isCustom: false and the slug
  const mappedStatic = activeStaticSubjects.map(sub => {
    const slug = sub.question.replace(/ /g, '-').toLowerCase();
    return {
      ...sub,
      isCustom: false,
      slug: slug
    };
  });

  // Dynamically load subjects from the 4553 crawled papers
  const crawledSubjectsForSem = React.useMemo(() => {
    if (!course) return [];
    
    // Normalize course name (e.g. "B.Tech" -> "BTECH", "BCA" -> "BCA")
    const normalizedCourseName = course.name.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    const matchingPapers = makautPapers.filter(paper => {
      const paperCourse = paper.course.toUpperCase().replace(/[^A-Z0-9]/g, '');
      return paperCourse === normalizedCourseName && paper.semester === semesterNumber;
    });
    
    // Extract unique subjects based on subject code or slugified name
    const uniqueSubjectsMap = new Map<string, { question: string; code: string; year: string; slug: string }>();
    matchingPapers.forEach(paper => {
      const cleanedName = cleanSubjectName(paper);
      const slug = getSubjectSlug(paper.course, paper.semester, cleanedName);
      
      if (!uniqueSubjectsMap.has(slug)) {
        uniqueSubjectsMap.set(slug, {
          question: cleanedName,
          code: paper.code,
          year: paper.year,
          slug
        });
      }
    });
    
    return Array.from(uniqueSubjectsMap.values()).map((details) => ({
      question: details.question,
      type: 'Theory',
      year: details.year,
      code: details.code.toLowerCase(),
      isCustom: false,
      slug: details.slug
    }));
  }, [course, semesterNumber]);

  // Filter out any custom subjects that are already defined statically
  const uniqueCustomSubjects = customSubjects.filter(
    name => !activeStaticSlugs.has(name)
  );

  // Map unique custom subjects to the UI subject format
  const mappedCustom = uniqueCustomSubjects.map(name => {
    const formattedName = name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    return {
      question: formattedName,
      type: 'Theory',
      year: '2023-2024',
      isCustom: true,
      slug: name
    };
  });

  // Merge subjects from all three sources, deduplicating by slug
  const allSubjectsMap = new Map<string, any>();
  mappedStatic.forEach(sub => allSubjectsMap.set(sub.slug, sub));
  crawledSubjectsForSem.forEach(sub => {
    if (!allSubjectsMap.has(sub.slug)) {
      allSubjectsMap.set(sub.slug, sub);
    }
  });
  mappedCustom.forEach(sub => {
    if (!allSubjectsMap.has(sub.slug)) {
      allSubjectsMap.set(sub.slug, sub);
    }
  });

  const allSubjects = Array.from(allSubjectsMap.values());

  const handleSubjectClick = (subject: any) => {
    navigate(`/university/${universityId}/course/${courseId}/semester/${semester}/${subject.slug}`);
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error('Subject name cannot be empty');
      return;
    }

    const slug = newSubjectName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!slug) {
      toast.error('Invalid subject name');
      return;
    }

    setIsSubmitting(true);
    try {
      await db.upsertQuestions(
        universityId || '',
        courseId || '',
        semester || '',
        slug,
        ''
      );
      toast.success('Subject paper added successfully!');
      setIsDialogOpen(false);
      setNewSubjectName('');
      await fetchCustomSubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
      toast.error('Failed to add subject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showAddOption = !!user;

  return (
    <Box sx={{ 
      minHeight: '80vh', 
      backgroundColor: 'background.default',
      backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
    }}>
      <Toaster position="top-center" />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Back Button and Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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
            
            {showAddOption && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setIsDialogOpen(true)}
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
                Add Paper
              </Button>
            )}
          </Stack>
          
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
                label={loadingCustom ? 'Loading subjects...' : `Semester ${semesterNumber} • ${allSubjects.length} Subjects`}
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

        {/* Loading Indicator */}
        {loadingCustom ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
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
              {allSubjects.map((subject, index) => (
                <Zoom in={true} timeout={600} style={{ transitionDelay: `${index * 100}ms` }} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
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
                        },
                        '& .subject-actions': {
                          opacity: 1,
                          transform: 'translateY(0)'
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
                    {showAddOption && (
                      <Box
                        className="subject-actions"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          zIndex: 2,
                          display: 'flex',
                          gap: 1,
                          opacity: 0,
                          transform: 'translateY(-8px)',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleEditClick(subject);
                          }}
                          sx={{
                            color: 'text.secondary',
                            backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteClick(subject);
                          }}
                          sx={{
                            color: 'text.secondary',
                            backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                              color: 'error.main',
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Card>
                </Zoom>
              ))}
            </Box>

            {/* Empty State */}
            {allSubjects.length === 0 && (
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
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Subjects for this semester will be added soon.
                  </Typography>
                  {showAddOption && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setIsDialogOpen(true)}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Add Paper
                    </Button>
                  )}
                </Box>
              </Fade>
            )}
          </>
        )}
      </Container>

      {/* Add Paper Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => !isSubmitting && setIsDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            width: '100%',
            maxWidth: 450
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Add New Paper/Subject</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the name of the subject. A new empty question paper slide will be created for this semester.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Subject Name"
            placeholder="e.g., Computer Networks"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            disabled={isSubmitting}
            variant="outlined"
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setIsDialogOpen(false)} 
            disabled={isSubmitting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddSubject} 
            disabled={isSubmitting}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            {isSubmitting ? 'Adding...' : 'Add Paper'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Paper Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={() => !isSubmitting && setIsEditDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            width: '100%',
            maxWidth: 450
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Rename Paper/Subject</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the new name for the subject.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Subject Name"
            value={editSubjectName}
            onChange={(e) => setEditSubjectName(e.target.value)}
            disabled={isSubmitting}
            variant="outlined"
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setIsEditDialogOpen(false)} 
            disabled={isSubmitting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubject} 
            disabled={isSubmitting}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            {isSubmitting ? 'Renaming...' : 'Rename'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onClose={() => !isSubmitting && setIsDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            width: '100%',
            maxWidth: 450
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Paper/Subject</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>{deletingSubject?.question}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ fontWeight: 'medium' }}>
            Warning: This action will permanently remove this subject and all its associated question papers. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)} 
            disabled={isSubmitting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteSubject} 
            disabled={isSubmitting}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
