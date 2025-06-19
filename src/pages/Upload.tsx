// Enhanced Upload Component with PDF Processing Integration
import React, { useState } from 'react';
import { Upload as UploadIcon, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
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

const SkeletonUploadForm = () => (
  <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md animate-pulse">
    <div className="text-center">
      <div className="mx-auto h-12 w-12 bg-gray-200 rounded-full"></div>
      <h2 className="mt-6 text-3xl font-extrabold text-gray-400">Loading...</h2>
    </div>
    <div className="mt-8 space-y-6">
      <div className="h-10 bg-gray-200 rounded-md"></div>
      <div className="h-10 bg-gray-200 rounded-md"></div>
      <div className="h-32 bg-gray-200 rounded-md"></div>
      <div className="h-10 bg-gray-200 rounded-md"></div>
    </div>
  </div>
);

// Progress Bar Component
const ProgressBar: React.FC<{ percentage: number }> = ({ 
  percentage
}) => {
  // Don't render anything if percentage is 0 or undefined
  if (!percentage || percentage <= 0) {
    return null;
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );
};

// Processing Status Component
const ProcessingStatus: React.FC<{ result: ProcessingResult }> = ({ result }) => {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'uploading':
      case 'downloading':
      case 'processing':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (result.status) {
      case 'uploading':
      case 'downloading':
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="font-medium capitalize">{result.status}</p>
          <p className="text-sm">{result.message}</p>
          {result.questionsCount !== undefined && result.questionsCount > 0 && (
            <p className="text-sm mt-1">
              ✅ {result.questionsCount} questions extracted successfully
            </p>
          )}
          {result.status === 'downloading' && (
            <div className="text-sm mt-1 text-blue-600">
              {result.progress && (
                <p className="text-xs mt-1 text-blue-500">
                  {result.progress}
                </p>
              )}
              {result.downloadPercentage !== undefined && result.downloadPercentage > 0 && (
                <ProgressBar 
                  percentage={result.downloadPercentage}
                />
              )}
            </div>
          )}
          {result.status === 'processing' && (
            <div className="text-sm mt-1 text-blue-600">
              {result.progress && (
                <p className="text-xs mt-1 text-blue-500">
                  {result.progress}
                </p>
              )}
              {result.percentage !== undefined && result.percentage > 0 && (
                <ProgressBar 
                  percentage={result.percentage} 
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Upload() {
  const { user, loading } = useAuth();
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploaderName, setUploaderName] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Force file input reset
  
  // PDF Processing states
  const [processingEnabled, setProcessingEnabled] = useState(true);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUniversity(e.target.value);
    setCourse('');
    setSemester('');
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCourse(e.target.value);
    setSemester('');
  };

  // Webhook endpoint - Update this to your deployed webhook server
  const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:8000/webhook/process-pdf';

  const triggerPDFProcessing = async (fileUrl: string, filename: string, paperId: string) => {
    if (!processingEnabled) return;

    try {
      setProcessingResult({
        processingId: '',
        status: 'processing',
        message: 'Starting PDF question extraction...'
      });

      const metadata = {
        semester: `SEM-${semester}`,
        subject_code: '', // You might want to extract this from filename or add a field
        subject_name: filename.replace(/\.(pdf|PDF)$/, ''),
        year: new Date().getFullYear(),
        university: university,
        course: course,
        paper_type: 'Regular'
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_url: fileUrl,
          filename: filename,
          metadata: metadata,
          paper_id: paperId
        })
      });

      const result = await response.json();

      if (result.success) {
        setProcessingResult({
          processingId: result.processing_id,
          status: 'processing',
          message: 'PDF processing started. This may take a few minutes...'
        });

        // Poll for status updates
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
      setProcessingResult({
        processingId: '',
        status: 'failed',
        message: 'Failed to connect to PDF processing service',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const pollProcessingStatus = async (processingId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${WEBHOOK_URL.replace('/webhook/process-pdf', '')}/status/${processingId}`);
        const statusData = await response.json();

        if (statusData.success) {
          const status = statusData.status;
          
          // Use the backend message directly to avoid duplication
          const displayMessage = statusData.message;
          
          setProcessingResult({
            processingId: processingId,
            status: status,
            message: displayMessage,
            questionsCount: statusData.questions_count,
            progress: statusData.progress,
            percentage: statusData.percentage,
            currentQuestion: statusData.currentQuestion,
            totalQuestions: statusData.totalQuestions,
            downloadPercentage: statusData.downloadPercentage,
            downloadedSize: statusData.downloadedSize,
            totalSize: statusData.totalSize
          });

          if (status === 'completed') {
            toast.success(`PDF processed successfully! ${statusData.questions_count || 0} questions extracted.`);
            return;
          } else if (status === 'failed') {
            toast.error('PDF processing failed. Please try again.');
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts && ['processing', 'queued', 'downloading'].includes(statusData.status)) {
          setTimeout(checkStatus, 5000); // Check again in 5 seconds
        } else if (attempts >= maxAttempts) {
          setProcessingResult({
            processingId: processingId,
            status: 'failed',
            message: 'Processing timeout. Please try again.',
            error: 'Timeout'
          });
        }
      } catch (error) {
        console.error('Error checking processing status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        }
      }
    };

    checkStatus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    if (file.size > 2 * 1024 * 1024) {
      setFileError('File size must not exceed 2MB.');
      return;
    }

    if (!user || !user.id) {
      toast.error('You must be logged in to upload papers.');
      console.error('User authentication issue:', { user, userId: user?.id });
      return;
    }

    // Debug: Check user authentication
    console.log('User authentication check:', {
      user: user,
      userId: user.id,
      userEmail: user.email || 'No email',
      isAuthenticated: !!user
    });

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

      console.log('🚀 Starting upload process:', {
        originalFileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        lastModified: file.lastModified,
        generatedFileName: fileName,
        filePath: filePath,
        timestamp: new Date().toISOString()
      });

      const { error: uploadError } = await supabase.storage
        .from('edupapers')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast.error(`Failed to upload file: ${uploadError.message}`);
        setProcessingResult(null);
        return;
      }

      const { data: fileData } = supabase.storage
        .from('edupapers')
        .getPublicUrl(filePath);

      console.log('✅ File uploaded successfully:', {
        publicUrl: fileData.publicUrl,
        fileName: fileName,
        timestamp: new Date().toISOString()
      });

      // Debug: Check current user session before database operation
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log('Supabase session check:', {
        session: session?.session,
        user: session?.session?.user,
        sessionUserId: session?.session?.user?.id,
        localUserId: user.id,
        sessionError
      });

      // Save to database and get the paper ID
      const insertData = {
        user_id: user.id,
        university,
        course,
        semester,
        file_url: fileData.publicUrl,
        file_name: file.name,
        uploader_name: uploaderName,
        processing_status: 'pending'
      };
      
      console.log('Attempting to insert paper with data:', insertData);
      
      const { data: paperData, error: dbError } = await supabase.from('papers').insert(insertData).select('id').single();

      if (dbError) {
        console.error('Error saving file metadata:', dbError);
        toast.error(`Failed to save file metadata: ${dbError.message}`);
        setProcessingResult(null);
      } else {
        toast.success('File uploaded successfully!');
        
        // Reset form after successful upload
        setFile(null);
        setFileName(null);
        setFileInputKey(Date.now()); // Force file input reset
        setFileError(null);
        
        // Trigger PDF Processing with paper ID
        if (processingEnabled && file.name.toLowerCase().endsWith('.pdf') && paperData?.id) {
          await triggerPDFProcessing(fileData.publicUrl, file.name, paperData.id);
        } else {
          setProcessingResult(null);
        }
      }
    } catch (error) {
      console.error('Error during upload:', error);
      toast.error('An unexpected error occurred during upload.');
      setProcessingResult(null);
    } finally {
      setUploadLoading(false);
      setUniversity('');
      setCourse('');
      setSemester('');
      setFile(null);
      setFileName(null);
      setUploaderName('');
      setFileError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('📁 File selected:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        lastModified: selectedFile.lastModified,
        timestamp: new Date().toISOString()
      });
      
      if (selectedFile.size > 2 * 1024 * 1024) {
        setFile(null);
        setFileName(null);
        setFileError('File size must not exceed 2MB.');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      setFile(null);
      setFileName(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      {loading ? (
        <SkeletonUploadForm />
      ) : (
        <div className="max-w-2xl w-full mx-4">
          <Toaster position="top-center" />
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
              <UploadIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Upload Question Paper
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Share your exam papers and let AI extract questions automatically
            </p>
          </div>

          {/* Processing Status */}
          {processingResult && (
            <div className="mb-6">
              <ProcessingStatus result={processingResult} />
            </div>
          )}

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Paper Details</h2>
            </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            {/* PDF Processing Toggle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={processingEnabled}
                  onChange={(e) => setProcessingEnabled(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-blue-900">
                    🤖 Auto-extract questions using AI
                  </div>
                  <div className="text-xs text-blue-700">
                    For PDF files - automatically detect and extract questions
                  </div>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="uploaderName" className="form-label">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="uploaderName"
                  name="uploaderName"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="input-field"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="university" className="form-label">
                  Select University <span className="text-red-500">*</span>
                </label>
                <select
                  id="university"
                  name="university"
                  required
                  value={university}
                  onChange={handleUniversityChange}
                  className="form-select"
                >
                  <option value="">Choose a university</option>
                  {universities.map((uni) => (
                    <option key={uni.id} value={uni.name}>{uni.name}</option>
                  ))}
                </select>
              </div>

              {university && (
                <div className="form-group">
                  <label htmlFor="course" className="form-label">
                    Select Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="course"
                    name="course"
                    required
                    value={course}
                    onChange={handleCourseChange}
                    className="form-select"
                  >
                    <option value="">Choose a course</option>
                    {universities
                      .find((uni) => uni.name === university)?.courses
                      .map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                  </select>
                </div>
              )}

              {course && (
                <div className="form-group">
                  <label htmlFor="semester" className="form-label">
                    Select Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    required
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Choose a semester</option>
                    {universities
                      .find((uni) => uni.name === university)?.courses
                      .find((c) => c.name === course)?.semesters &&
                      Array.from({ length: universities
                        .find((uni) => uni.name === university)?.courses
                        .find((c) => c.name === course)?.semesters || 0 }, (_, i) => i + 1)
                      .map((sem) => (
                        <option key={sem} value={sem}>{sem}th Semester</option>
                      ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* File Upload Section - Full Width */}
            <div className="border-t border-gray-200 pt-6">
            <div className="form-group">
              <label className="form-label">
                Upload File <span className="text-red-500">*</span>
              </label>
              <div className={`relative mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl transition-all duration-200 ${
                file 
                  ? 'border-green-300 bg-green-50/50' 
                  : fileError 
                    ? 'border-red-300 bg-red-50/50' 
                    : 'border-gray-300 bg-gray-50/30 hover:border-indigo-400 hover:bg-indigo-50/30'
              }`}>
                <div className="space-y-3 text-center">
                  {file ? (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative">
                        <FileText className="mx-auto h-16 w-16 text-green-500" />
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="bg-white px-4 py-3 rounded-lg border border-green-200 shadow-sm">
                        <p className="font-medium text-gray-900">Selected file:</p>
                        <p className="text-sm text-gray-600 mt-1">{fileName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setFileName(null);
                          setFileError(null);
                          setFileInputKey(Date.now());
                        }}
                        className="text-sm text-gray-500 hover:text-red-500 transition-colors duration-200"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto h-16 w-16 text-gray-400">
                        <UploadIcon className="h-full w-full" />
                      </div>
                      <div className="flex flex-col items-center text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 transition-colors duration-200"
                        >
                          <span className="bg-white px-3 py-1 rounded-md border border-indigo-200 hover:border-indigo-300 transition-all duration-200">
                            Upload a file
                          </span>
                          <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            required 
                            onChange={handleFileChange} 
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            key={fileInputKey}
                          />
                        </label>
                        <p className="mt-2 text-gray-500">or drag and drop</p>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium">
                          PDF, DOC, DOCX, JPG, PNG up to 2MB
                        </p>
                      </div>
                    </>
                  )}
                  {fileError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-700 font-medium">{fileError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={uploadLoading || !!fileError}
                className={`w-full flex items-center justify-center space-x-3 px-6 py-4 border border-transparent text-base font-medium rounded-xl text-white transition-all duration-200 ${
                  uploadLoading || !!fileError
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                }`}
              >
                {uploadLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-5 w-5" />
                    <span>Upload & Process Paper</span>
                  </>
                )}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
    </div>
  );
}
