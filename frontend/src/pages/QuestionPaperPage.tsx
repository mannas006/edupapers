import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { universities } from '../data/universities';
import QuestionEditor from '../components/QuestionEditor';
import toast, { Toaster } from 'react-hot-toast';
import supabase from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SkeletonLoading from '../components/SkeletonLoading';

export default function QuestionPaperPage() {
  const { universityId, courseId, semester, subjectName } = useParams();
  const navigate = useNavigate();
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
          toast.error('Failed to load profile data.');
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
    return <div className="min-h-[80vh] flex items-center justify-center">Subjects not found</div>;
  }

  const subjects = course.subjects[semesterNumber];
  const subject = subjects.find(sub => sub.question.replace(/ /g, '-').toLowerCase() === subjectName);

  if (!subject) {
    return <div className="min-h-[80vh] flex items-center justify-center">Question paper not found</div>;
  }

  const canEdit = () => {
    console.log('User Role:', userRole);
    console.log('User University ID:', userUniversityId);
    console.log('User Course ID:', userCourseId);
    console.log('Current University ID:', universityId);
    console.log('Current Course ID:', courseId);

    // Ensure we have the necessary data
    if (!userRole) {
      console.log('Required user data is missing.');
      return false;
    }

    // Admin can edit any question, so bypass university/course checks for admin
    if (userRole === 'admin') {
      console.log('Admin can edit.');
      return true;
    }

    // Pro user can edit if they belong to the same university
    if (userRole === 'pro' && String(userUniversityId) === String(universityId)) {
      console.log('Pro user can edit.');
      return true;
    }

    // Gold user can edit if they belong to the same university and course
    if (userRole === 'gold') {
      console.log('Gold user role detected.');

      // Check if the university and course match
      if (String(userUniversityId) === String(universityId) && String(userCourseId) === String(courseId)) {
        console.log('Gold user can edit because they belong to the same university and course.');
        return true;
      } else {
        console.log('Gold user cannot edit because university/course do not match.');
        return false;
      }
    }

    console.log('User does not have permission to edit.');
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

  return (
    <div className="min-h-[80vh] bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-center" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-700 hover:text-indigo-600 mb-2 sm:mb-0"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          {canEdit() && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center text-gray-700 hover:text-indigo-600"
            >
              <Edit className="h-5 w-5 mr-1" />
              Edit
            </button>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-8 text-center">{formattedSubjectName} Questions</h1>
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
            <SkeletonLoading />
          </div>
        ) : isEditing ? (
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
            <QuestionEditor
              initialContent={questions}
              onSave={handleSaveQuestions}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
            {questions ? (
              <div className="prose prose-sm md:prose-base max-w-none" dangerouslySetInnerHTML={{ __html: questions }} />
            ) : (
              <p className="text-gray-700">
                No sample questions available for this subject.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
