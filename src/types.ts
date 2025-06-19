export interface University {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  courses: Course[];
}

export interface Course {
  id: string;
  name: string;
  semesters: number;
  subjects?: { [semester: number]: { question: string, type: string, year: string }[] };
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
}

// New type for flattened subject data for search
export interface SearchableSubject {
  universityId: string;
  universityName: string;
  courseId: string;
  courseName: string;
  semester: number;
  subjectName: string;
}
