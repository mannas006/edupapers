import React from 'react';
import type { University } from '../types';
import { Link } from 'react-router-dom';

interface UniversityCardProps {
  university: University;
  onClick: (university: University) => void;
}

const DefaultUniversityLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400">
    <path d="M2 3h20v6H2z" />
    <path d="M4 9v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
    <path d="M10 13h4" />
    <path d="M10 17h4" />
  </svg>
);

const SkeletonLogo = () => (
  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full animate-pulse"></div>
);

const SkeletonText = () => (
  <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse mb-1 sm:mb-2 w-3/4 mx-auto"></div>
);

const SkeletonCourses = () => (
  <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
);

export default function UniversityCard({ university, onClick }: UniversityCardProps) {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const img = new Image();
    img.src = university.logo || '';
    img.onload = () => setLoading(false);
    img.onerror = () => setLoading(false);
  }, [university.logo]);

  const handleClick = () => {
    onClick(university);
  };

  return (
    <Link 
      to={`/university/${university.id}`}
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col h-full"
    >
      <div className="p-3 sm:p-4 flex flex-col h-full">
        <div className="flex items-center justify-center mb-2 sm:mb-4">
          {loading ? (
            <SkeletonLogo />
          ) : (
            university.logo ? (
              <img
                src={university.logo}
                alt={`${university.name} logo`}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-contain"
              />
            ) : (
              <DefaultUniversityLogo />
            )
          )}
        </div>
        <div className="flex-1">
          {loading ? (
            <SkeletonText />
          ) : (
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center mb-1 sm:mb-2 truncate">{university.shortName || university.name}</h3>
          )}
          {loading ? (
            <SkeletonCourses />
          ) : (
            <p className="text-gray-600 text-center text-sm">
              {university.courses.length} Courses
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-gray-200 p-2 sm:p-4 text-center">
        <span className="text-sm text-indigo-600 hover:text-indigo-500">View Papers</span>
      </div>
    </Link>
  );
}
