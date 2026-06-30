import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Skeleton,
  Chip,
  useTheme,
  alpha,
  Grid,
  TextField,
  InputAdornment,
  List,
  ListItem,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import { 
  School, 
  ArrowForward, 
  Search, 
  CloudDownload, 
  OpenInNew, 
  Event, 
  Campaign,
  Code,
  TrendingUp
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { universities } from '../data/universities';
import { collegeUpdates } from '../data/updates';
import { makautPapers } from '../data/makaut_papers';

interface SearchablePaper {
  id: string;
  universityId: string;
  universityName: string;
  universityShortName: string;
  courseId: string;
  courseName: string;
  semester: number;
  subjectName: string;
  subjectCode: string;
  years: string[];
}

const CourseCard: React.FC<{ course: any; index: number }> = ({ course, index }) => {
  const theme = useTheme();

  const getCourseIcon = (courseName: string) => {
    const name = courseName.toUpperCase();
    if (name.includes('B.TECH')) {
      return <School sx={{ fontSize: { xs: 30, sm: 44 }, color: 'primary.main' }} />;
    } else if (name.includes('M.TECH')) {
      return <School sx={{ fontSize: { xs: 30, sm: 44 }, color: 'secondary.main' }} />;
    } else if (name.includes('BCA')) {
      return <Code sx={{ fontSize: { xs: 30, sm: 44 }, color: 'info.main' }} />;
    } else if (name.includes('MCA')) {
      return <Code sx={{ fontSize: { xs: 30, sm: 44 }, color: 'success.main' }} />;
    } else if (name.includes('MBA')) {
      return <TrendingUp sx={{ fontSize: { xs: 30, sm: 44 }, color: 'warning.main' }} />;
    } else if (name.includes('BBA')) {
      return <TrendingUp sx={{ fontSize: { xs: 30, sm: 44 }, color: 'error.main' }} />;
    }
    return <School sx={{ fontSize: { xs: 30, sm: 44 }, color: 'primary.main' }} />;
  };

  return (
    <Card
      component={Link}
      to={`/university/8/course/${course.id}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        borderRadius: 4,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.98)})`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
          borderColor: alpha(theme.palette.primary.main, 0.3),
          '& .course-avatar': {
            boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.25)}`,
            transform: 'scale(1.05)'
          },
          '& .view-btn': {
            backgroundColor: 'primary.main',
            color: 'white',
            transform: 'translateX(4px)'
          }
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3 }, pb: { xs: 2.5, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 2, sm: 3 } }}>
          <Avatar
            className="course-avatar"
            sx={{
              width: { xs: 54, sm: 80 },
              height: { xs: 54, sm: 80 },
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              p: { xs: 0.8, sm: 1 }
            }}
          >
            {getCourseIcon(course.name)}
          </Avatar>
        </Box>
        
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
            fontSize: { xs: '0.95rem', sm: '1.15rem', md: '1.25rem' },
            lineHeight: 1.3,
            minHeight: { xs: 28, sm: 36 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5
          }}
        >
          {course.name}
          <ArrowForward sx={{ display: { xs: 'inline-flex', sm: 'none' }, fontSize: 16, color: 'primary.main' }} />
        </Typography>
        
        <Chip
          label={`${course.semesters} Semesters`}
          size="small"
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
            fontWeight: 600,
            borderRadius: 2,
            px: 1
          }}
        />
      </CardContent>
      
      <CardActions sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'center', pb: 3, pt: 0, px: 3 }}>
        <Button
          className="view-btn"
          variant="outlined"
          endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
          fullWidth
          sx={{
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            py: 0.8,
            px: 1,
            borderColor: alpha(theme.palette.primary.main, 0.15),
            color: 'primary.main',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.main',
              color: 'white'
            }
          }}
        >
          Select Semesters
        </Button>
      </CardActions>
    </Card>
  );
};

export default function Home() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchFocused, setSearchFocused] = useState(false);
  const [coursesVisibleCount, setCoursesVisibleCount] = useState(6);

  // States for the dedicated MAKAUT portal
  const [makautSearchQuery, setMakautSearchQuery] = useState('');
  const [makautActiveCourse, setMakautActiveCourse] = useState('All');
  const [makautVisibleCount, setMakautVisibleCount] = useState(6);

  // Find the single MAKAUT university from config
  const makautUniversity = useMemo(() => {
    return universities.find(uni => uni.id === '8') || universities[0];
  }, []);

  // Flatten and group all subjects with codes from the 4,553 papers database
  const allPapers = useMemo(() => {
    const uniqueSubjectsMap = new Map<string, {
      id: string;
      universityId: string;
      universityName: string;
      universityShortName: string;
      courseId: string;
      courseName: string;
      semester: number;
      subjectName: string;
      subjectCode: string;
      years: string[];
    }>();
    
    if (makautUniversity) {
      makautPapers.forEach(paper => {
        // Find matching course id from universities.ts
        const matchedCourse = makautUniversity.courses.find(c => 
          c.name.toUpperCase().replace(/[^A-Z0-9]/g, '') === paper.course.toUpperCase().replace(/[^A-Z0-9]/g, '')
        );
        const courseId = matchedCourse ? matchedCourse.id : '21';
        
        // Use subject code as unique key (or fallback to id if code is generic)
        const key = paper.code && paper.code !== 'GENERIC' 
          ? `${paper.course}-${paper.semester}-${paper.code.toLowerCase()}` 
          : paper.id.toLowerCase();
          
        const existing = uniqueSubjectsMap.get(key);
        if (existing) {
          if (!existing.years.includes(paper.year)) {
            existing.years.push(paper.year);
          }
        } else {
          uniqueSubjectsMap.set(key, {
            id: paper.id,
            universityId: '8',
            universityName: makautUniversity.name,
            universityShortName: 'MAKAUT',
            courseId,
            courseName: paper.course,
            semester: paper.semester,
            subjectName: paper.title.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            subjectCode: paper.code,
            years: [paper.year]
          });
        }
      });
      
      // Sort years in descending order for each subject
      uniqueSubjectsMap.forEach(sub => {
        sub.years.sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
      });
    }
    
    return Array.from(uniqueSubjectsMap.values());
  }, [makautUniversity]);

  // Filter papers for search dropdown
  const filteredPapers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allPapers.filter(paper => 
      paper.subjectName.toLowerCase().includes(q) ||
      paper.subjectCode.toLowerCase().includes(q) ||
      paper.courseName.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery, allPapers]);

  // Filter updates
  const filteredUpdates = useMemo(() => {
    if (activeCategory === 'All') return collegeUpdates;
    return collegeUpdates.filter(up => up.category === activeCategory);
  }, [activeCategory]);

  // Filter for the dedicated archive portal
  const filteredMakautPapers = useMemo(() => {
    return makautPapers.filter(paper => {
      const matchCourse = makautActiveCourse === 'All' || paper.course === makautActiveCourse;
      const matchSearch = !makautSearchQuery.trim() || 
        paper.title.toLowerCase().includes(makautSearchQuery.toLowerCase()) ||
        paper.code.toLowerCase().includes(makautSearchQuery.toLowerCase()) ||
        paper.year.toLowerCase().includes(makautSearchQuery.toLowerCase());
      return matchCourse && matchSearch;
    });
  }, [makautSearchQuery, makautActiveCourse]);

  const getMakautLink = (paper: SearchablePaper, year: string) => {
    // Look up directly in makautPapers database
    const matchedPaper = makautPapers.find(p => {
      const matchSlug = p.code.toLowerCase() === paper.subjectCode.toLowerCase();
      return matchSlug && p.year === year;
    });
    
    if (matchedPaper) return matchedPaper.pdfUrl;
    
    // Fallback if not found in crawled database
    const courseSlug = paper.courseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const subjectSlug = paper.subjectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const codeSlug = paper.subjectCode.toLowerCase();
    return `https://www.makaut.com/papers/${courseSlug}-${paper.semester}-sem-${subjectSlug}-${codeSlug}-${year}.pdf`;
  };

  const getUpdateCategoryColor = (category: string) => {
    switch (category) {
      case 'Urgent': return 'error';
      case 'Exams': return 'primary';
      case 'Results': return 'success';
      case 'Academic': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '85vh', 
      backgroundColor: 'background.default',
      backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.015)} 0%, ${alpha(theme.palette.secondary.main, 0.015)} 100%)`
    }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 4, sm: 6 }, pb: { xs: 2, sm: 3 } }}>
        
        {/* Premium Integrated Hero Banner & Search (No Fade wrapper for instant static render) */}
        <Box 
          sx={{ 
            position: 'relative',
            borderRadius: 6,
            mb: 6,
            color: 'white',
            boxShadow: `0 24px 48px ${alpha(theme.palette.primary.main, 0.25)}`,
            p: { xs: 4, sm: 6, md: 8 },
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Background Layer with overflow: hidden to clip ::before gradient background */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 6,
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              zIndex: 1,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
              }
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 800, width: '100%' }}>
            <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
              <School sx={{ fontSize: { xs: 38, sm: 48 }, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))' }} />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 850,
                  fontSize: { xs: '2rem', sm: '3.2rem', md: '4rem' },
                  letterSpacing: '-0.03em',
                  textShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                MAKAUT Exam Portal
              </Typography>
            </Stack>
            
            <Typography 
              variant="h6" 
              sx={{ 
                opacity: 0.9, 
                fontWeight: 400,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                maxWidth: 600,
                mx: 'auto',
                mb: 3,
                lineHeight: 1.5
              }}
            >
              Access verified past year question papers and official exam updates for MAKAUT.
            </Typography>

            {/* Hero Statistics Panel */}
            <Stack 
              direction="row" 
              spacing={2} 
              justifyContent="center" 
              sx={{ mb: 4, flexWrap: 'wrap', gap: 1.5 }}
            >
              <Chip
                icon={<CloudDownload sx={{ color: 'white !important', fontSize: 16 }} />}
                label="210+ Verified Papers"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />
              <Chip
                icon={<School sx={{ color: 'white !important', fontSize: 16 }} />}
                label="6 Degree Programs"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />
              <Chip
                icon={<Campaign sx={{ color: 'white !important', fontSize: 16 }} />}
                label="Real-time Announcements"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />
            </Stack>

            {/* Integrated Search Input Container */}
            <Box 
              sx={{ 
                position: 'relative', 
                maxWidth: 620, 
                mx: 'auto',
                zIndex: 10
              }}
            >
              <TextField
                fullWidth
                placeholder="Enter MAKAUT subject code (e.g. mic101, bcac102) or subject name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'primary.main', fontSize: 24 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <Button size="small" onClick={() => setSearchQuery('')} sx={{ color: 'text.secondary', textTransform: 'none' }}>Clear</Button>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    backgroundColor: 'background.paper',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    p: 0.5,
                    pl: 2,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& fieldset': { border: 'none' },
                    '&.Mui-focused': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 12px 36px rgba(0,0,0,0.25)'
                    }
                  },
                  '& input::placeholder': {
                    opacity: 0.6
                  }
                }}
              />

              {/* Floating Absolute Dropdown for Search Results */}
              {searchQuery.trim() && searchFocused && (
                <Paper 
                  elevation={16} 
                  sx={{ 
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    mt: 1.5,
                    borderRadius: 4, 
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                    zIndex: 99,
                    textAlign: 'left',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)}, ${alpha(theme.palette.background.paper, 1)})`,
                    backdropFilter: 'blur(15px)',
                    boxShadow: `0 20px 45px ${alpha(theme.palette.common.black, 0.2)}`
                  }}
                >
                  {filteredPapers.length > 0 ? (
                    <List disablePadding>
                      {filteredPapers.map((paper, idx) => (
                        <React.Fragment key={paper.id}>
                          {idx > 0 && <Divider />}
                          <ListItem 
                            sx={{ 
                              py: 2.5, 
                              px: 3.5, 
                              display: 'flex', 
                              flexDirection: { xs: 'column', sm: 'row' }, 
                              alignItems: { xs: 'flex-start', sm: 'center' }, 
                              justifyContent: 'space-between', 
                              gap: 2,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.03)
                              }
                            }}
                          >
                            <Box>
                              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                                <Chip 
                                  label={paper.subjectCode.toUpperCase()} 
                                  size="small" 
                                  color="primary" 
                                  sx={{ fontWeight: 700, borderRadius: 1.5, height: 24 }}
                                />
                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                  {paper.subjectName}
                                </Typography>
                              </Stack>
                              <Typography variant="body2" color="text.secondary">
                                {paper.courseName} • Semester {paper.semester}
                              </Typography>
                            </Box>

                            {/* Action Buttons */}
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                              {paper.years.slice(0, 5).map(year => (
                                <Button
                                  key={year}
                                  variant="contained"
                                  size="small"
                                  color="primary"
                                  startIcon={<CloudDownload sx={{ fontSize: 13 }} />}
                                  href={getMakautLink(paper, year)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    py: 0.6,
                                    px: 1.8
                                  }}
                                >
                                  {year}
                                </Button>
                              ))}
                            </Stack>
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                      <Typography variant="body1" fontWeight="medium">No papers matching your search found.</Typography>
                      <Typography variant="caption">Try searching for subject codes like "mic101" or "bcac102".</Typography>
                    </Box>
                  )}
                </Paper>
              )}
            </Box>

            {/* Quick Tag Recommendations */}
            <Stack 
              direction="row" 
              spacing={1.5} 
              justifyContent="center" 
              alignItems="center" 
              sx={{ mt: 2.5, flexWrap: 'wrap', gap: 1 }}
            >
              <Typography variant="caption" sx={{ opacity: 0.75, fontWeight: 500 }}>
                Popular Searches:
              </Typography>
              {['mic101', 'bcac102', 'B.Tech', '2026', 'Mathematics'].map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onClick={() => {
                    setSearchQuery(tag);
                    setSearchFocused(true);
                  }}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                />
              ))}
            </Stack>

          </Box>
        </Box>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, letterSpacing: '-0.02em' }}>
                <School color="primary" sx={{ fontSize: 28 }} />
                Explore Degree Courses
              </Typography>
            </Box>
            
            <Box 
              sx={{ 
                display: 'grid',
                gap: 2.5,
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(6, 1fr)'
                }
              }}
            >
              {makautUniversity && makautUniversity.courses.slice(0, coursesVisibleCount).map((course, index) => (
                <CourseCard course={course} key={course.id} index={index} />
              ))}
            </Box>

            {/* View All / Show Less Toggle Button */}
            {makautUniversity && makautUniversity.courses.length > 6 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (coursesVisibleCount === 6) {
                      setCoursesVisibleCount(makautUniversity.courses.length);
                    } else {
                      setCoursesVisibleCount(6);
                    }
                  }}
                  sx={{
                    borderRadius: 3.5,
                    textTransform: 'none',
                    fontWeight: 750,
                    py: 1.2,
                    px: 5,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    borderWidth: 2,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.03)}`,
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: 'primary.main',
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.08)}`
                    }
                  }}
                >
                  {coursesVisibleCount === 6 
                    ? `View All Courses (${makautUniversity.courses.length - 6} more)` 
                    : 'Show Less Courses'}
                </Button>
              </Box>
            )}

        {/* DEDICATED MAKAUT ARCHIVE SECTION */}
        <Divider sx={{ my: 4, opacity: 0.4 }} />

        <Paper
          elevation={0}
          sx={{
            pt: { xs: 4, sm: 5 },
            px: { xs: 3, sm: 5 },
            pb: { xs: 3, sm: 4 },
            borderRadius: 6,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.98)})`,
            backdropFilter: 'blur(15px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            boxShadow: `0 32px 64px ${alpha(theme.palette.primary.main, 0.05)}`,
            mb: 2
          }}
        >
          {/* Header Section */}
          <Box 
            sx={{ 
              mb: 4.5, 
              display: 'flex', 
              flexDirection: { xs: 'column', lg: 'row' }, 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', lg: 'center' }, 
              gap: 3.5 
            }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <Typography 
                  variant="h4" 
                  fontWeight="800" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    letterSpacing: '-0.03em',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.8rem', md: '2.2rem' }
                  }}
                >
                  <CloudDownload sx={{ fontSize: 36, color: theme.palette.primary.main }} />
                  MAKAUT Official Paper Archive
                </Typography>
                <Chip 
                  label={`Database: ${makautPapers.length} Papers`}
                  color="primary"
                  variant="filled"
                  size="small"
                  sx={{ fontWeight: 700, borderRadius: 1.5, display: { xs: 'none', sm: 'inline-flex' } }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem', maxWidth: 700 }}>
                Browse, search, and download verified past year university question papers directly crawled from makaut.com.
              </Typography>
            </Box>

            {/* Course filter badges */}
            <Stack 
              direction="row" 
              spacing={1} 
              sx={{ 
                overflowX: { xs: 'auto', lg: 'visible' },
                whiteSpace: { xs: 'nowrap', lg: 'normal' },
                flexWrap: { xs: 'nowrap', lg: 'wrap' },
                gap: { xs: 1, lg: 1.2 },
                width: '100%',
                justifyContent: { xs: 'flex-start', lg: 'flex-end' },
                pb: { xs: 1.5, lg: 0 },
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              {['All', 'BTECH', 'BCA', 'BBA', 'MBA', 'MCA', 'MTECH', 'BSC', 'BPHARM', 'MSC'].map(course => (
                <Chip
                  key={course}
                  label={course === 'All' ? 'Show All Courses' : course}
                  onClick={() => {
                    setMakautActiveCourse(course);
                    setMakautVisibleCount(6); // reset visibility count
                  }}
                  color={makautActiveCourse === course ? 'primary' : 'default'}
                  variant={makautActiveCourse === course ? 'filled' : 'outlined'}
                  sx={{ 
                    cursor: 'pointer', 
                    borderRadius: 2, 
                    fontWeight: 650,
                    px: 0.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-1px)'
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search MAKAUT archive by name, subject code or year (e.g. chemistry, bsm101, 2026)..."
              value={makautSearchQuery}
              onChange={(e) => {
                setMakautSearchQuery(e.target.value);
                setMakautVisibleCount(6); // reset visibility count
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: makautSearchQuery && (
                  <Button size="small" onClick={() => setMakautSearchQuery('')} sx={{ textTransform: 'none' }}>Clear</Button>
                )
              }}
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3.5,
                  backgroundColor: alpha(theme.palette.background.default, 0.4),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  '& fieldset': { border: 'none' },
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.2)
                  },
                  '&.Mui-focused': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 16px ${alpha(theme.palette.primary.main, 0.08)}`
                  }
                }
              }}
            />

            <Chip
              label={`${filteredMakautPapers.length} matches found`}
              color="secondary"
              variant="outlined"
              sx={{ 
                fontWeight: 600, 
                height: 36, 
                borderRadius: 2.5, 
                px: 1,
                alignSelf: { xs: 'flex-start', md: 'center' }
              }}
            />
          </Box>

          {/* Paper Grid */}
          <Grid container spacing={3.5}>
            {filteredMakautPapers.slice(0, makautVisibleCount).map((paper) => (
              <Grid item xs={12} sm={6} md={4} key={paper.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4.5,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)}, ${alpha(theme.palette.background.default, 0.8)})`,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.02)}`,
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
                      borderColor: alpha(theme.palette.primary.main, 0.25)
                    }
                  }}
                >
                  <CardContent sx={{ p: 3.5, flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                      <Chip
                        label={paper.course}
                        color="primary"
                        size="small"
                        sx={{ 
                          fontWeight: 800, 
                          height: 22, 
                          fontSize: '0.65rem', 
                          borderRadius: 1.5,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                        }}
                      />
                      <Chip
                        label={`Semester ${paper.semester}`}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          fontWeight: 700, 
                          height: 22, 
                          fontSize: '0.65rem', 
                          borderRadius: 1.5,
                          borderColor: alpha(theme.palette.text.secondary, 0.2),
                          color: 'text.secondary'
                        }}
                      />
                    </Stack>
                    
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold" 
                      gutterBottom 
                      sx={{ 
                        lineHeight: 1.4, 
                        fontSize: '0.98rem', 
                        mb: 2.5, 
                        minHeight: 48, 
                        color: 'text.primary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {paper.title.replace(/-/g, ' ')}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
                      <Chip
                        icon={<Code sx={{ fontSize: '12px !important' }} />}
                        label={`Code: ${paper.code}`}
                        variant="outlined"
                        size="small"
                        sx={{ height: 22, fontSize: '0.7rem', borderRadius: 1.5, border: 'none', bgcolor: alpha(theme.palette.divider, 0.05) }}
                      />
                      <Chip
                        label={`Year: ${paper.year}`}
                        variant="outlined"
                        size="small"
                        sx={{ height: 22, fontSize: '0.7rem', borderRadius: 1.5, border: 'none', bgcolor: alpha(theme.palette.divider, 0.05) }}
                      />
                    </Stack>
                  </CardContent>
                  
                  <CardActions sx={{ px: 3.5, pb: 3.5, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<CloudDownload />}
                      endIcon={<OpenInNew sx={{ fontSize: 13 }} />}
                      href={paper.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 700,
                        py: 1.2,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: `0 4px 18px ${alpha(theme.palette.primary.main, 0.25)}`,
                        transition: 'all 0.25s',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                          boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                          transform: 'scale(1.01)'
                        }
                      }}
                    >
                      Download PDF
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Load More Button */}
          {filteredMakautPapers.length > makautVisibleCount && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setMakautVisibleCount(prev => prev + 9)}
                sx={{
                  borderRadius: 4,
                  textTransform: 'none',
                  fontWeight: 750,
                  py: 1.4,
                  px: 6,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  color: 'primary.main',
                  borderWidth: 2,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.03)}`,
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.08)}`
                  }
                }}
              >
                Load More Papers ({filteredMakautPapers.length - makautVisibleCount} remaining)
              </Button>
            </Box>
          )}

          {filteredMakautPapers.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center', border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 4, backgroundColor: 'transparent' }}>
              <Typography variant="body1" color="text.secondary" fontWeight="medium">
                No papers found matching the search criteria.
              </Typography>
            </Paper>
          )}
        </Paper>

      </Container>
    </Box>
  );
}
