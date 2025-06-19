import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const SkeletonProfileForm = () => (
  <div className="max-w-md w-full space-y-8 p-4 sm:p-8 bg-white rounded-lg shadow-md animate-pulse">
    <div className="text-center">
      <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-400">Loading...</h2>
    </div>
    <div className="mt-8 space-y-6">
      <div className="h-10 bg-gray-200 rounded-md"></div>
      <div className="h-10 bg-gray-200 rounded-md"></div>
      <div className="h-10 bg-gray-200 rounded-md"></div>
    </div>
  </div>
);

export default function Profile() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [courseId, setCourseId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      if (user) {
        setEmail(user.email || '');

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, role, university_id, course_id')
            .eq('email', user.email)
            .single();

          if (error) {
            console.error('Error fetching profile data:', error);
            toast.error('Failed to load profile data.');
          } else if (data) {
            setFullName(data.full_name || '');
            setRole(data.role || '');
            setUniversityId(data.university_id || '');
            setCourseId(data.course_id || '');
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
          toast.error('An unexpected error occurred while loading profile data.');
        }
      }
    };

    fetchProfileData();
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`An unexpected error occurred during profile update: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <SkeletonProfileForm />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-4 sm:p-8 bg-white rounded-lg shadow-md">
        <Toaster position="top-center" />
        <div className="text-center">
          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">Your Profile</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                disabled
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label htmlFor="role" className="form-label">Role</label>
              <input
                id="role"
                name="role"
                type="text"
                value={role}
                disabled
                className="input-field"
              />
            </div>
             <div className="form-group">
              <label htmlFor="universityId" className="form-label">University ID</label>
              <input
                id="universityId"
                name="universityId"
                type="text"
                value={universityId}
                disabled
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label htmlFor="courseId" className="form-label">Course ID</label>
              <input
                id="courseId"
                name="courseId"
                type="text"
                value={courseId}
                disabled
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                disabled
                className="input-field"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
