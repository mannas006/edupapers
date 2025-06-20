import React from 'react';
import { Link } from 'react-router-dom';
import type { SearchableSubject } from '../types';

interface SearchResultsDropdownProps {
  results: SearchableSubject[];
  query: string;
  onResultClick: () => void;
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({ results, query, onResultClick }) => {
  if (!query) {
    return null; // Don't show dropdown if query is empty
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto z-20">
      {results.length > 0 ? (
        <ul>
          {results.map((subject, index) => (
            <li key={index} className="border-b border-gray-100 last:border-b-0">
              <Link
                to={`/university/${subject.universityId}/course/${subject.courseId}/semester/${subject.semester}/${subject.subjectName.replace(/ /g, '-').toLowerCase()}`}
                className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                onClick={onResultClick}
              >
                <p className="text-sm font-medium text-gray-900">{subject.subjectName}</p>
                <p className="text-xs text-gray-500">
                  {subject.universityName} - {subject.courseName} - Semester {subject.semester}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-3 text-gray-500 text-sm">No results found</div>
      )}
    </div>
  );
};

export default SearchResultsDropdown;
