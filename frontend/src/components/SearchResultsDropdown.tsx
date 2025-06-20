import React from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import type { SearchableSubject } from '../types';

interface SearchResultsDropdownProps {
  results: SearchableSubject[];
  query: string;
  onResultClick: () => void;
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({ results, query, onResultClick }) => {
  const { isDarkMode } = useDarkMode();
  
  if (!query) {
    return null; // Don't show dropdown if query is empty
  }

  return (
    <div className={`absolute top-full left-0 right-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto z-20 border transition-colors duration-200`}>
      {results.length > 0 ? (
        <ul>
          {results.map((subject, index) => (
            <li key={index} className={`${isDarkMode ? 'border-gray-700' : 'border-gray-100'} border-b last:border-b-0`}>
              <Link
                to={`/university/${subject.universityId}/course/${subject.courseId}/semester/${subject.semester}/${subject.subjectName.replace(/ /g, '-').toLowerCase()}`}
                className={`block px-4 py-3 ${isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900'} transition-colors duration-150`}
                onClick={onResultClick}
              >
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{subject.subjectName}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {subject.universityName} - {subject.courseName} - Semester {subject.semester}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No results found</div>
      )}
    </div>
  );
};

export default SearchResultsDropdown;
