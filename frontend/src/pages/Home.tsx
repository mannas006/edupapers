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
  Skeleton,
  Fade,
  Zoom,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { School, ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { universities } from '../data/universities';
import type { University } from '../types';

const SkeletonUniversityCard = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={80} height={80} />
      </Box>
      <Skeleton variant="text" height={32} width="70%" sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton variant="text" height={20} width="50%" sx={{ mx: 'auto' }} />
    </CardContent>
    <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
    </CardActions>
  </Card>
);

interface UniversityCardProps {
  university: University;
  index: number;
}

const UniversityCard: React.FC<UniversityCardProps> = ({ university, index }) => {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    if (university.logo) {
      const img = new Image();
      img.src = university.logo;
      img.onload = () => setLoading(false);
      img.onerror = () => {
        setLoading(false);
        setImageError(true);
      };
    } else {
      setLoading(false);
    }
  }, [university.logo]);

  return (
    <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
      <Card
        component={Link}
        to={`/university/${university.id}`}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          textDecoration: 'none',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
            '& .view-papers-btn': {
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
      >
        <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {loading ? (
              <Skeleton variant="circular" width={80} height={80} />
            ) : (
              <Avatar
                src={!imageError ? university.logo : undefined}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: imageError ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  }
                }}
              >
                {imageError && <School sx={{ fontSize: 40, color: 'primary.main' }} />}
              </Avatar>
            )}
          </Box>
          
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: 1,
              minHeight: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {university.shortName || university.name}
          </Typography>
          
          <Chip
            label={`${university.courses.length} Courses`}
            size="small"
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
            className="view-papers-btn"
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
            View Papers
          </Button>
        </CardActions>
      </Card>
    </Zoom>
  );
};

export default function Home() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '80vh', backgroundColor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <Fade in={true} timeout={800}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6, md: 8 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <School 
                sx={{ 
                  fontSize: { xs: 32, sm: 40, md: 48 }, 
                  color: 'primary.main',
                  mr: 1
                }} 
              />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center'
                }}
              >
                Explore Universities
              </Typography>
            </Box>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                lineHeight: 1.6
              }}
            >
              Access previous year question papers from top universities across India
            </Typography>
          </Box>
        </Fade>

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
          {universities.map((university, index) => (
            <UniversityCard key={university.id} university={university} index={index} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
