import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import theme from './theme/mui-theme';
import NavbarMUI from './components/NavbarMUI';
import Home from './pages/Home';
import LoginMUI from './pages/LoginMUI';
import UploadMUI from './pages/UploadMUI';
import ProfileMUI from './pages/ProfileMUI';
import UniversityPageMUI from './pages/UniversityPageMUI';
import CoursePageMUI from './pages/CoursePageMUI';
import AboutUsMUI from './pages/AboutUsMUI';
import ContactUsMUI from './pages/ContactUsMUI';
import SubjectPageMUI from './pages/SubjectPageMUI';
import QuestionPaperPageMUI from './pages/QuestionPaperPageMUI';

function App() {
  const currentYear = 2025;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <NavbarMUI />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginMUI />} />
          <Route path="/upload" element={<UploadMUI />} />
          <Route path="/profile" element={<ProfileMUI />} />
          <Route path="/university/:universityId" element={<UniversityPageMUI />} />
          <Route path="/university/:universityId/course/:courseId" element={<CoursePageMUI />} />
          <Route path="/university/:universityId/course/:courseId/semester/:semester" element={<SubjectPageMUI />} />
          <Route path="/university/:universityId/course/:courseId/semester/:semester/:subjectName" element={<QuestionPaperPageMUI />} />
          <Route path="/about" element={<AboutUsMUI />} />
          <Route path="/contact" element={<ContactUsMUI />} />
        </Routes>

        <Box component="footer" sx={{ backgroundColor: 'background.paper', mt: 8, py: 4 }}>
          <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3, textAlign: 'center' }}>
            <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              © {currentYear} EduPapers. All rights reserved. | Developed by{' '}
              <Box
                component="a"
                href="https://webnexalabs.onrender.com/"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                WebNexaLabs
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
