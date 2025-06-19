import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Stack,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Divider,
  Chip
} from '@mui/material';
import {
  School,
  Group,
  Instagram,
  GitHub,
  Code,
  ContentPaste,
  Engineering
} from '@mui/icons-material';

const teamMembers = [
  {
    name: 'Manas',
    role: 'Lead Developer',
    photo: '/assets/manas2.jpg',
    instagram: 'https://www.instagram.com',
    github: 'https://github.com/mannas006',
    icon: <Engineering />
  },
  {
    name: 'Anirban',
    role: 'Developer',
    photo: 'https://i.pinimg.com/564x/8b/1a/94/8b1a9469971816194228191111222222.jpg',
    instagram: 'https://www.instagram.com',
    github: 'https://github.com',
    icon: <Code />
  },
  {
    name: 'Ananda',
    role: 'Content Manager',
    photo: 'https://i.pinimg.com/564x/8b/1a/94/8b1a9469971816194228191111222222.jpg',
    instagram: 'https://www.instagram.com',
    github: 'https://github.com',
    icon: <ContentPaste />
  },
  {
    name: 'Nowshin',
    role: 'Content Manager',
    photo: 'https://i.pinimg.com/564x/8b/1a/94/8b1a9469971816194228191111222222.jpg',
    instagram: 'https://www.instagram.com',
    github: 'https://github.com',
    icon: <ContentPaste />
  },
];

const TeamMemberCard: React.FC<{ member: typeof teamMembers[0]; index: number }> = ({ member, index }) => {
  const theme = useTheme();
  
  return (
    <Zoom in={true} style={{ transitionDelay: `${index * 200}ms` }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.shadows[12],
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
      >
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Avatar
            src={member.photo}
            sx={{
              width: 100,
              height: 100,
              border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                transform: 'scale(1.05)',
              }
            }}
          />
          <Avatar
            sx={{
              position: 'absolute',
              bottom: -8,
              right: -8,
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              border: `2px solid ${theme.palette.background.paper}`,
            }}
          >
            {member.icon}
          </Avatar>
        </Box>
        
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {member.name}
        </Typography>
        
        <Chip
          label={member.role}
          variant="outlined"
          size="small"
          sx={{
            borderColor: alpha(theme.palette.primary.main, 0.3),
            color: 'primary.main',
            fontWeight: 500,
            mb: 2
          }}
        />
        
        <Stack direction="row" spacing={1}>
          {member.instagram && (
            <IconButton
              component="a"
              href={member.instagram}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: '#E4405F',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <Instagram />
            </IconButton>
          )}
          {member.github && (
            <IconButton
              component="a"
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: '#333',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <GitHub />
            </IconButton>
          )}
        </Stack>
      </Card>
    </Zoom>
  );
};

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

        {/* Team Section */}
        <Fade in={true} timeout={1400}>
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                Our Team
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                <Group sx={{ color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary">
                  Meet the people behind EduPapers
                </Typography>
              </Stack>
            </Box>
            
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
              {teamMembers.map((member, index) => (
                <TeamMemberCard key={index} member={member} index={index} />
              ))}
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
