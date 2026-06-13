export interface AppUser {
  id: string;
  email: string | null;
  [key: string]: any;
}

export interface UserProfile {
  full_name?: string | null;
  role: string | null;
  university_id: string | null;
  course_id: string | null;
}

export interface QuestionRecord {
  id?: string;
  university_id: string;
  course_id: string;
  semester: string;
  subject_name: string;
  content: string;
}

export interface PaperRecord {
  id?: string | number;
  user_id: string;
  university: string;
  course: string;
  semester: string;
  year: number;
  subject: string;
  file_url: string;
  file_name: string;
  uploader_name: string;
  processing_status: string;
}

export interface AuthAdapter {
  getCurrentUser(): Promise<AppUser | null>;
  onAuthStateChange(callback: (user: AppUser | null) => void): () => void;
  signInWithEmail(email: string, password: string): Promise<AppUser>;
  logout(): Promise<void>;
}

export interface DatabaseAdapter {
  getQuestions(universityId: string, courseId: string, semester: string, subjectName: string): Promise<string>;
  upsertQuestions(universityId: string, courseId: string, semester: string, subjectName: string, content: string): Promise<void>;
  getProfile(email: string): Promise<UserProfile | null>;
  updateProfile(email: string, profile: Partial<UserProfile>): Promise<void>;
  createPaper(paper: Omit<PaperRecord, 'id'>): Promise<{ id: string | number; [key: string]: any }>;
  getSemesterSubjects(universityId: string, courseId: string, semester: string): Promise<string[]>;
  renameSubject(universityId: string, courseId: string, semester: string, oldSubjectName: string, newSubjectName: string): Promise<void>;
  deleteSubject(universityId: string, courseId: string, semester: string, subjectName: string): Promise<void>;
}

export interface StorageAdapter {
  uploadPaper(filePath: string, file: File): Promise<string>;
}

export interface BackendAdapter {
  auth: AuthAdapter;
  db: DatabaseAdapter;
  storage: StorageAdapter;
}
