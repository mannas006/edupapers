// Enhanced Upload Component with PDF Processing Integration
// This replaces your existing src/pages/Upload.tsx

import React, { useState } from 'react';
import { Upload as UploadIcon, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { universities } from '../data/universities';
import supabase from '../lib/supabase';

// Processing status types
type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

interface ProcessingResult {
  processingId: string;
  status: ProcessingStatus;
  message: string;
  questionsCount?: number;
  error?: string;
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

// Processing Status Component
const ProcessingStatus: React.FC<{ result: ProcessingResult }> = ({ result }) => {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'uploading':
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
          {result.questionsCount && (
            <p className="text-sm mt-1">
              ✅ {result.questionsCount} questions extracted successfully
            </p>
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
  const WEBHOOK_URL = process.env.REACT_APP_WEBHOOK_URL || 'http://localhost:8000/webhook/process-pdf';

  const triggerPDFProcessing = async (fileUrl: string, filename: string) => {
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
          metadata: metadata
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
          
          setProcessingResult({
            processingId: processingId,
            status: status,
            message: statusData.message,
            questionsCount: statusData.questions_count
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

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('edupapers')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast.error(`Failed to upload file: ${uploadError.message}`);
        setProcessingResult(null);
        return;
      }

      // Get public URL
      const { data: fileData, error: fileUrlError } = supabase.storage
        .from('edupapers')
        .getPublicUrl(filePath);

      if (fileUrlError) {
        console.error('Error getting file URL:', fileUrlError);
        toast.error(`Failed to get file URL: ${fileUrlError.message}`);
        setProcessingResult(null);
        return;
      }

      // Save to database
      const { error: dbError } = await supabase.from('papers').insert({
        user_id: user.id,
        university,
        course,
        semester,
        file_url: fileData.publicUrl,
        file_name: file.name,
        uploader_name: uploaderName,
      });

      if (dbError) {
        console.error('Error saving file metadata:', dbError);
        toast.error(`Failed to save file metadata: ${dbError.message}`);
        setProcessingResult(null);
      } else {
        toast.success('File uploaded successfully!');
        
        // Trigger PDF Processing
        if (processingEnabled && file.name.toLowerCase().endsWith('.pdf')) {
          await triggerPDFProcessing(fileData.publicUrl, file.name);
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
      if (e.target.files[0].size > 2 * 1024 * 1024) {
        setFile(null);
        setFileName(null);
        setFileError('File size must not exceed 2MB.');
        return;
      }
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    } else {
      setFile(null);
      setFileName(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <SkeletonUploadForm />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-4 sm:p-8 bg-white rounded-lg shadow-md">
        <Toaster position="top-center" />
        <div className="text-center">
          <UploadIcon className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">Upload Question Paper</h2>
          <p className="mt-2 text-sm text-gray-600">
            Upload PDF files to automatically extract questions
          </p>
        </div>

        {/* Processing Status */}
        {processingResult && (
          <ProcessingStatus result={processingResult} />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* PDF Processing Toggle */}
            <div className="form-group">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={processingEnabled}
                  onChange={(e) => setProcessingEnabled(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-indigo-600"
                />
                <span className="text-sm text-gray-700">
                  🤖 Auto-extract questions using AI (for PDF files)
                </span>
              </label>
            </div>

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

          <div className="form-group">
            <label className="form-label">
              Upload File <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      required
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                {fileName && <p className="text-sm text-gray-500 mt-2">Selected file: {fileName}</p>}
                {fileError && <p className="text-sm text-red-500 mt-2">{fileError}</p>}
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, JPG, PNG up to 2MB
                </p>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={uploadLoading || !!fileError}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {uploadLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4" />
                  <span>Upload & Process Paper</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
