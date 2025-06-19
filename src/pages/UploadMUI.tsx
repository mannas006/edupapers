// Enhanced Upload Component with PDF Processing Integration - MUI Version
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  Slide,
  Zoom,
  useTheme,
  alpha,
  CircularProgress,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import {
  Upload as UploadIcon,
  Description as FileIcon,
  CheckCircle,
  Error as ErrorIcon,
  CloudUpload,
  School,
  Class,
  Schedule,
  Person,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  SmartToy,
  Psychology
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { universities } from '../data/universities';
import supabase from '../lib/supabase';

// Processing status types
type ProcessingStatus = 'idle' | 'uploading' | 'downloading' | 'processing' | 'completed' | 'failed';

interface ProcessingResult {
  processingId: string;
  status: ProcessingStatus;
  message: string;
  questionsCount?: number;
  error?: string;
  progress?: string;
  percentage?: number;
  currentQuestion?: number;
  totalQuestions?: number;
  downloadPercentage?: number;
  downloadedSize?: number;
  totalSize?: number;
}

// Styled Components
const DropzoneContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isDragActive',
})<{ isDragActive: boolean }>(({ theme, isDragActive }) => ({
  padding: theme.spacing(4),
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  backgroundColor: isDragActive 
    ? alpha(theme.palette.primary.main, 0.05) 
    : alpha(theme.palette.background.paper, 0.5),
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  textAlign: 'center',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(2),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1.1rem',
  boxShadow: theme.shadows[4],
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  }
}));

// Progress Bar Component
const ProgressBar: React.FC<{ percentage: number; label?: string }> = ({ 
  percentage, 
  label 
}) => {
  if (!percentage || percentage <= 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {label && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <LinearProgress 
        variant="determinate" 
        value={Math.min(percentage, 100)} 
        sx={{
          height: 8,
          borderRadius: 4,
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          }
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
        {Math.round(percentage)}%
      </Typography>
    </Box>
  );
};

// Processing Status Component
const ProcessingStatus: React.FC<{ result: ProcessingResult }> = ({ result }) => {
  const theme = useTheme();
  
  const getStatusConfig = () => {
    switch (result.status) {
      case 'uploading':
        return {
          icon: <CloudUpload color="primary" />,
          color: 'info' as const,
          bgcolor: alpha(theme.palette.info.main, 0.1)
        };
      case 'downloading':
        return {
          icon: <CircularProgress size={20} color="primary" />,
          color: 'info' as const,
          bgcolor: alpha(theme.palette.info.main, 0.1)
        };
      case 'processing':
        return {
          icon: <CircularProgress size={20} color="primary" />,
          color: 'info' as const,
          bgcolor: alpha(theme.palette.info.main, 0.1)
        };
      case 'completed':
        return {
          icon: <CheckCircle color="success" />,
          color: 'success' as const,
          bgcolor: alpha(theme.palette.success.main, 0.1)
        };
      case 'failed':
        return {
          icon: <ErrorIcon color="error" />,
          color: 'error' as const,
          bgcolor: alpha(theme.palette.error.main, 0.1)
        };
      default:
        return {
          icon: <FileIcon />,
          color: 'default' as const,
          bgcolor: alpha(theme.palette.grey[500], 0.1)
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Fade in={true}>
      <Card sx={{ mt: 2, bgcolor: config.bgcolor }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            {config.icon}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 0.5 }}>
                {result.status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {result.message}
              </Typography>
              
              {result.questionsCount && (
                <Chip
                  label={`${result.questionsCount} questions extracted`}
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
              
              {Boolean(result.currentQuestion && result.totalQuestions && 
               result.currentQuestion > 0 && result.totalQuestions > 0 && 
               result.status !== 'completed' && result.status === 'processing') && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Processing question {result.currentQuestion} of {result.totalQuestions}
                </Typography>
              )}
            </Box>
          </Stack>
          
          {Boolean(result.percentage && result.percentage > 0 && result.status !== 'completed') && (
            <ProgressBar 
              percentage={result.percentage!} 
              label={result.progress}
            />
          )}
          
          {Boolean(result.downloadPercentage && result.downloadPercentage > 0 && result.status !== 'completed') && (
            <ProgressBar 
              percentage={result.downloadPercentage!} 
              label="Download Progress"
            />
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

// File Upload Item Component
const FileUploadItem: React.FC<{ 
  file: File; 
  onRemove: () => void;
  error?: string;
}> = ({ file, onRemove, error }) => {
  const theme = useTheme();
  
  return (
    <Zoom in={true}>
      <Card sx={{ mt: 2, border: error ? `1px solid ${theme.palette.error.main}` : 'none' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <FileIcon color={error ? "error" : "primary"} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" fontWeight={500}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </Typography>
            </Box>
            <IconButton onClick={onRemove} size="small" color="error">
              <CloseIcon />
            </IconButton>
          </Stack>
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Zoom>
  );
};

// Main Upload Component
export default function UploadMUI() {
  const { user } = useAuth();
  const theme = useTheme();
  
  // Check if Supabase is properly configured
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [enableAIExtraction, setEnableAIExtraction] = useState(true);
  
  // UI state
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [processingResult, setProcessingResult] = useState<ProcessingResult>({
    processingId: '',
    status: 'idle',
    message: ''
  });
  const [fileInputKey, setFileInputKey] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [aiServiceAvailable, setAiServiceAvailable] = useState<boolean | null>(null);

  // Constants
  // Webhook endpoint - uses environment variable or defaults to local server
  const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:8000/webhook/process-pdf';
  const currentYear = new Date().getFullYear();

  // Check AI service availability on component mount
  useEffect(() => {
    const checkAIService = async () => {
      try {
        const response = await fetch(WEBHOOK_URL.replace('/webhook/process-pdf', '/health'));
        setAiServiceAvailable(response.ok);
      } catch {
        setAiServiceAvailable(false);
      }
    };
    checkAIService();
  }, [WEBHOOK_URL]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false,
    maxSize: 2 * 1024 * 1024 // 2MB
  });

  const handleFileSelection = (selectedFile: File) => {
    setFileError('');
    
    if (selectedFile.size > 2 * 1024 * 1024) {
      setFileError('File size must not exceed 2MB.');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError('Invalid file type. Please select PDF, DOC, DOCX, JPG, or PNG files.');
      return;
    }

    setFile(selectedFile);
    setProcessingResult({
      processingId: '',
      status: 'idle',
      message: ''
    });
  };

  const removeFile = () => {
    setFile(null);
    setFileError('');
    setFileInputKey(prev => prev + 1);
    setProcessingResult({
      processingId: '',
      status: 'idle',
      message: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      toast.error('Application not configured. Please set up Supabase environment variables.');
      return;
    }
    
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    if (!university || !course || !semester) {
      toast.error('Please select university, course, and semester.');
      return;
    }

    if (!uploaderName.trim()) {
      toast.error('Please enter your name.');
      return;
    }

    if (!year || parseInt(year) < 2000 || parseInt(year) > new Date().getFullYear()) {
      toast.error('Please enter a valid year.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileError('File size must not exceed 2MB.');
      return;
    }

    if (!user || !user.id) {
      toast.error('You must be logged in to upload papers.');
      return;
    }

    setUploadLoading(true);
    setProcessingResult({
      processingId: '',
      status: 'uploading',
      message: 'Uploading PDF to storage...'
    });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `papers/${fileName}`;

      console.log('Starting upload process:', {
        fileName,
        fileSize: file.size,
        fileType: file.type,
        enableAIExtraction,
        user: user.id
      });

      // Upload to Supabase Storage - use the existing 'edupapers' bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('edupapers')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      if (!uploadData) {
        throw new Error('Failed to upload file to storage');
      }

      // Get public URL using the edupapers bucket
      const { data: urlData } = supabase.storage
        .from('edupapers')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get file URL');
      }

      // Save to database - matching original Upload.tsx structure
      const { data: dbData, error: dbError } = await supabase
        .from('papers')
        .insert({
          user_id: user.id,
          university: university,
          course: course,
          semester: semester,
          year: parseInt(year),
          subject: subjectName || 'General',
          file_url: urlData.publicUrl,
          file_name: file.name,
          uploader_name: uploaderName,
          processing_status: enableAIExtraction ? 'pending' : 'completed'
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      // Trigger PDF processing only if AI extraction is enabled
      if (enableAIExtraction) {
        try {
          await triggerPDFProcessing(urlData.publicUrl, dbData.id);
        } catch (processingError) {
          // Don't let AI processing errors fail the entire upload
          console.warn('AI processing failed, but upload was successful:', processingError);
          setProcessingResult({
            processingId: '',
            status: 'completed',
            message: 'File uploaded successfully! AI processing is currently unavailable.'
          });
          toast.success('File uploaded successfully! (AI processing unavailable)');
        }
      } else {
        setProcessingResult({
          processingId: '',
          status: 'completed',
          message: 'File uploaded successfully without AI processing!'
        });
        toast.success('File uploaded successfully!');
      }

    } catch (error) {
      console.error('Upload error:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      let errorMessage = 'Upload failed. Please try again.';
      let toastMessage = 'Upload failed. Please check your connection and try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('File size too large')) {
          errorMessage = 'File size exceeds the limit (2MB max).';
          toastMessage = 'File too large. Please use a file under 2MB.';
        } else if (error.message.includes('Invalid file type')) {
          errorMessage = 'Invalid file type. Please use PDF, DOC, DOCX, JPG, or PNG.';
          toastMessage = 'Invalid file type. Please use supported formats.';
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = 'Network error. Please check your connection.';
          toastMessage = 'Connection error. Please check your internet and try again.';
        } else if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          errorMessage = 'File with this name already exists. Please rename and try again.';
          toastMessage = 'File already exists. Please rename your file.';
        }
      }
      
      setProcessingResult({
        processingId: '',
        status: 'failed',
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error(toastMessage);
    } finally {
      setUploadLoading(false);
    }
  };

  const triggerPDFProcessing = async (fileUrl: string, recordId: number) => {
    try {
      setProcessingResult({
        processingId: '',
        status: 'processing',
        message: 'Starting PDF processing...'
      });

      // First check if the local processing service is available
      const healthCheck = await fetch(WEBHOOK_URL.replace('/webhook/process-pdf', '/health'), {
        method: 'GET',
      }).catch(() => null);

      if (!healthCheck || !healthCheck.ok) {
        // PDF processor is not available, mark as completed without AI processing
        setProcessingResult({
          processingId: '',
          status: 'completed',
          message: 'File uploaded successfully! AI processing is currently unavailable.'
        });
        toast.success('File uploaded successfully! (AI processing unavailable)');
        return;
      }

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_url: fileUrl,
          filename: file?.name || 'unknown',
          metadata: {
            university: university,
            course: course,
            semester: semester,
            year: year,
            subject: subjectName || 'General',
            uploader_name: uploaderName
          },
          paper_id: recordId
        })
      });

      const result = await response.json();

      if (result.success) {
        setProcessingResult({
          processingId: result.processing_id,
          status: 'processing',
          message: 'PDF processing started. This may take a few minutes...'
        });

        // Start polling for status updates
        toast.success('Upload successful! AI processing started...');
        pollProcessingStatus(result.processing_id);
      } else {
        setProcessingResult({
          processingId: '',
          status: 'failed',
          message: result.message || 'Failed to start PDF processing',
          error: result.message
        });
      }
    } catch (error) {
      console.error('Error triggering PDF processing:', error);
      
      // If AI processing fails, still consider the upload successful
      setProcessingResult({
        processingId: '',
        status: 'completed',
        message: 'File uploaded successfully! AI processing encountered an error but your file is saved.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Poll processing status function
  const pollProcessingStatus = async (processingId: string) => {
    const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const statusUrl = WEBHOOK_URL.replace('/webhook/process-pdf', `/status/${processingId}`);
        const response = await fetch(statusUrl);
        const statusData = await response.json();

        if (statusData.success) {
          const updateData: ProcessingResult = {
            processingId: processingId,
            status: statusData.status,
            message: statusData.message || 'Processing...',
            questionsCount: statusData.questionsCount
          };

          // Only include progress data if not completed
          if (statusData.status !== 'completed') {
            updateData.progress = statusData.progress;
            updateData.percentage = statusData.percentage || statusData.downloadPercentage;
            updateData.currentQuestion = statusData.currentQuestion;
            updateData.totalQuestions = statusData.totalQuestions;
          }

          setProcessingResult(updateData);

          // Check if processing is complete
          if (statusData.status === 'completed') {
            toast.success(`Processing completed! Found ${statusData.questionsCount || 0} questions.`);
            return;
          } else if (statusData.status === 'failed') {
            toast.error('AI processing failed, but your file was uploaded successfully.');
            return;
          }
        }

        // Continue polling if not complete and within max attempts
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          // Timeout after max attempts
          setProcessingResult({
            processingId: processingId,
            status: 'completed',
            message: 'Processing timed out, but your file was uploaded successfully.',
          });
          toast('Processing timed out, but your file was uploaded successfully.', { icon: '⚠️' });
        }
      } catch (error) {
        console.error('Error polling status:', error);
        // Stop polling on error but don't fail the upload
        setProcessingResult({
          processingId: processingId,
          status: 'completed',
          message: 'Unable to track processing status, but your file was uploaded successfully.',
        });
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 2000);
  };

  const resetForm = () => {
    setFile(null);
    setUniversity('');
    setCourse('');
    setSemester('');
    setYear('');
    setUploaderName('');
    setSubjectName('');
    setEnableAIExtraction(true);
    setFileError('');
    setProcessingResult({
      processingId: '',
      status: 'idle',
      message: ''
    });
    setFileInputKey(prev => prev + 1);
  };

  const selectedUniversity = universities.find(u => u.id === university);
  const selectedCourseData = selectedUniversity?.courses.find(c => c.id === course);

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Fade in={true}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <School sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Authentication Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please log in to upload question papers.
            </Typography>
            <Button variant="contained" size="large" href="/login">
              Login
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Toaster position="top-right" />
      
      {/* Configuration Warning */}
      {!isSupabaseConfigured && (
        <Fade in={true}>
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => {
                  toast.error('Please set up Supabase environment variables in .env file');
                }}
              >
                DETAILS
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>Configuration Required:</strong> Supabase environment variables are not set. 
              Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
            </Typography>
          </Alert>
        </Fade>
      )}
      
      <Slide direction="up" in={true} mountOnEnter unmountOnExit>
        <Box>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Upload Question Paper
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Help fellow students by sharing previous year question papers
            </Typography>
          </Box>

          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* University Selection */}
                <FormControl fullWidth>
                  <InputLabel id="university-label">University</InputLabel>
                  <Select
                    labelId="university-label"
                    value={university}
                    onChange={(e) => {
                      setUniversity(e.target.value);
                      setCourse('');
                      setSemester('');
                    }}
                    label="University"
                  >
                    {universities.map((uni) => (
                      <MenuItem key={uni.id} value={uni.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <School fontSize="small" />
                          <span>{uni.name}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Course Selection */}
                <FormControl fullWidth disabled={!university}>
                  <InputLabel id="course-label">Course</InputLabel>
                  <Select
                    labelId="course-label"
                    value={course}
                    onChange={(e) => {
                      setCourse(e.target.value);
                      setSemester('');
                    }}
                    label="Course"
                  >
                    {selectedUniversity?.courses.map((courseItem) => (
                      <MenuItem key={courseItem.id} value={courseItem.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Class fontSize="small" />
                          <span>{courseItem.name}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Semester Selection */}
                <FormControl fullWidth disabled={!course}>
                  <InputLabel id="semester-label">Semester</InputLabel>
                  <Select
                    labelId="semester-label"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    label="Semester"
                  >
                    {Array.from({ length: selectedCourseData?.semesters || 0 }, (_, i) => i + 1).map((sem) => (
                      <MenuItem key={sem} value={sem.toString()}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Schedule fontSize="small" />
                          <span>Semester {sem}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Year and Subject */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    inputProps={{ min: 2000, max: currentYear }}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Subject Name"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    fullWidth
                    placeholder="e.g., Mathematics, Physics"
                  />
                </Stack>

                {/* Uploader Name */}
                <TextField
                  label="Your Name"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />

                <Divider sx={{ my: 2 }} />

                {/* AI Processing Toggle */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmartToy sx={{ color: 'primary.main' }} />
                    AI Processing Options
                  </Typography>
                  
                  <Card sx={{ 
                    bgcolor: enableAIExtraction ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.grey[500], 0.05),
                    border: `1px solid ${enableAIExtraction ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.grey[500], 0.2)}`,
                    transition: 'all 0.3s ease-in-out'
                  }}>
                    <CardContent sx={{ py: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={enableAIExtraction}
                            onChange={(e) => setEnableAIExtraction(e.target.checked)}
                            color="primary"
                            size="medium"
                          />
                        }
                        label={
                          <Box>
                            <Typography component="div" variant="body1" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Psychology sx={{ fontSize: 20, color: enableAIExtraction ? 'primary.main' : 'text.secondary' }} />
                              Enable AI Question Extraction
                              {aiServiceAvailable === false && (
                                <Chip 
                                  label="Offline" 
                                  size="small" 
                                  color="warning" 
                                  sx={{ ml: 1, fontSize: '0.75rem' }}
                                />
                              )}
                              {aiServiceAvailable === true && (
                                <Chip 
                                  label="Online" 
                                  size="small" 
                                  color="success" 
                                  sx={{ ml: 1, fontSize: '0.75rem' }}
                                />
                              )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {enableAIExtraction && aiServiceAvailable === false
                                ? 'AI service is currently offline. Files will be uploaded without processing.'
                                : enableAIExtraction 
                                ? 'AI will automatically extract and organize questions from your PDF'
                                : 'Upload file as-is without AI processing (faster upload)'
                              }
                            </Typography>
                          </Box>
                        }
                      />
                      
                      {enableAIExtraction && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>AI Processing includes:</strong> Question extraction, categorization, 
                            and smart organization for better searchability.
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Box>

                {/* File Upload */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Upload Document
                  </Typography>
                  
                  {!file ? (
                    <DropzoneContainer {...getRootProps()} isDragActive={isDragActive}>
                      <input {...getInputProps()} key={fileInputKey} />
                      <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        or click to browse files
                      </Typography>
                      <Chip 
                        label="PDF, DOC, DOCX, JPG, PNG up to 2MB" 
                        variant="outlined" 
                        size="small"
                      />
                    </DropzoneContainer>
                  ) : (
                    <FileUploadItem
                      file={file}
                      onRemove={removeFile}
                      error={fileError}
                    />
                  )}
                </Box>

                {/* Processing Status */}
                {processingResult.status !== 'idle' && (
                  <Box>
                    <ProcessingStatus result={processingResult} />
                    {!enableAIExtraction && processingResult.status === 'completed' && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          Your file has been uploaded successfully without AI processing. 
                          You can enable AI extraction later if needed.
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                  <GradientButton
                    type="submit"
                    fullWidth
                    disabled={uploadLoading || !!fileError || !file}
                    startIcon={uploadLoading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                  >
                    {uploadLoading 
                      ? 'Uploading...' 
                      : enableAIExtraction 
                        ? 'Upload & Process with AI' 
                        : 'Upload Paper'
                    }
                  </GradientButton>
                  
                  <Button
                    variant="outlined"
                    onClick={resetForm}
                    startIcon={<RefreshIcon />}
                    disabled={uploadLoading}
                  >
                    Reset
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Paper>
        </Box>
      </Slide>
    </Container>
  );
}
