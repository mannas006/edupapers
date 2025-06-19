import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { universities } from '../data/universities';
import type { Course, University } from '../types';
import { ArrowLeft } from 'lucide-react';

export default function CoursePage() {
  const { universityId, courseId } = useParams();
  const navigate = useNavigate();

  const university = universities.find((uni) => uni.id === universityId);
  const course = university?.courses.find((c) => c.id === courseId);

  if (!university || !course) {
    return <div className="min-h-[80vh] flex items-center justify-center">Course not found</div>;
  }

  const handleSemesterClick = (semester: number) => {
    navigate(`/university/${universityId}/course/${courseId}/semester/${semester}`);
  };

  const semesters = Array.from({ length: course.semesters }, (_, i) => i + 1);

  return (
    <div className="min-h-[80vh] bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center mb-4 text-gray-700 hover:text-indigo-600"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{university.name} - {course.name}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {semesters.map((semester) => (
            <button
              key={semester}
              onClick={() => handleSemesterClick(semester)}
              className="card cursor-pointer"
            >
              <h3 className="card-header">Semester {semester}</h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
