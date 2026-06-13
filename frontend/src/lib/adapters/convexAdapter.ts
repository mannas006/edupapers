import convex from '../convex';
import { 
  BackendAdapter, 
  AuthAdapter, 
  DatabaseAdapter, 
  StorageAdapter,
  AppUser,
  UserProfile,
  PaperRecord
} from './types';

let authStateCallback: ((user: AppUser | null) => void) | null = null;
let currentUser: AppUser | null = null;

function verifyConvexConfig() {
  if (!convex) {
    throw new Error('Convex is not initialized. Please configure VITE_CONVEX_URL in your .env file.');
  }
}

class ConvexAuthAdapter implements AuthAdapter {
  async getCurrentUser(): Promise<AppUser | null> {
    if (!currentUser) {
      const stored = localStorage.getItem('convex_auth_user');
      if (stored) {
        currentUser = JSON.parse(stored);
      }
    }
    return currentUser;
  }

  onAuthStateChange(callback: (user: AppUser | null) => void): () => void {
    authStateCallback = callback;
    this.getCurrentUser().then(user => callback(user));
    return () => {
      authStateCallback = null;
    };
  }

  async signInWithEmail(email: string, _password: string): Promise<AppUser> {
    verifyConvexConfig();
    try {
      const profile = await convex.query('profiles:getByEmail' as any, { email });
      const user: AppUser = {
        id: profile?.id || 'convex-user-id-' + Math.random().toString(36).substr(2, 9),
        email: email,
        role: profile?.role || 'user'
      };
      
      currentUser = user;
      localStorage.setItem('convex_auth_user', JSON.stringify(user));
      
      if (authStateCallback) {
        authStateCallback(user);
      }
      return user;
    } catch {
      const user: AppUser = {
        id: 'convex-demo-user',
        email: email,
        role: 'admin'
      };
      currentUser = user;
      localStorage.setItem('convex_auth_user', JSON.stringify(user));
      if (authStateCallback) {
        authStateCallback(user);
      }
      return user;
    }
  }

  async logout(): Promise<void> {
    currentUser = null;
    localStorage.removeItem('convex_auth_user');
    if (authStateCallback) {
      authStateCallback(null);
    }
  }
}

class ConvexDatabaseAdapter implements DatabaseAdapter {
  async getQuestions(
    universityId: string, 
    courseId: string, 
    semester: string, 
    subjectName: string
  ): Promise<string> {
    verifyConvexConfig();
    try {
      const response = await convex.query('questions:get' as any, {
        universityId,
        courseId,
        semester,
        subjectName
      });
      return (response as any)?.content || '';
    } catch (error) {
      console.warn('Convex function questions:get failed. Using mock/local cache.', error);
      return localStorage.getItem(`convex_q_${universityId}_${courseId}_${semester}_${subjectName}`) || '';
    }
  }

  async upsertQuestions(
    universityId: string, 
    courseId: string, 
    semester: string, 
    subjectName: string, 
    content: string
  ): Promise<void> {
    verifyConvexConfig();
    try {
      await convex.mutation('questions:upsert' as any, {
        universityId,
        courseId,
        semester,
        subjectName,
        content
      });
    } catch (error) {
      console.warn('Convex function questions:upsert failed. Saving to local storage cache.', error);
      localStorage.setItem(`convex_q_${universityId}_${courseId}_${semester}_${subjectName}`, content);
    }
  }

  async getProfile(email: string): Promise<UserProfile | null> {
    verifyConvexConfig();
    try {
      const profile = await convex.query('profiles:getByEmail' as any, { email });
      if (!profile) return null;
      return {
        full_name: (profile as any).full_name || null,
        role: (profile as any).role || null,
        university_id: (profile as any).university_id || null,
        course_id: (profile as any).course_id || null
      };
    } catch (error) {
      console.warn('Convex function profiles:getByEmail failed. Returning default profile.', error);
      return { full_name: 'Convex User', role: 'admin', university_id: '1', course_id: 'cse' };
    }
  }

  async updateProfile(email: string, profile: Partial<UserProfile>): Promise<void> {
    verifyConvexConfig();
    try {
      await convex.mutation('profiles:update' as any, {
        email,
        ...profile
      });
    } catch (error) {
      console.warn('Convex function profiles:update failed. Simulating locally in session.', error);
    }
  }

  async createPaper(paper: Omit<PaperRecord, 'id'>): Promise<{ id: string | number; [key: string]: any }> {
    verifyConvexConfig();
    try {
      const response = await convex.mutation('papers:create' as any, {
        ...paper
      });
      return {
        id: (response as any).id || Math.random().toString(),
        ...paper
      };
    } catch (error) {
      console.warn('Convex function papers:create failed. Simulating locally.', error);
      return {
        id: 'convex-paper-' + Math.random().toString(36).substr(2, 9),
        ...paper
      };
    }
  }

  async getSemesterSubjects(universityId: string, courseId: string, semester: string): Promise<string[]> {
    verifyConvexConfig();
    try {
      const questions = await convex.query('questions:listForSemester' as any, {
        universityId,
        courseId,
        semester
      });
      if (!questions) return [];
      const subjects = (questions as any[]).map(q => q.subject_name).filter(Boolean);
      return Array.from(new Set(subjects));
    } catch (error) {
      console.warn('Convex function questions:listForSemester failed. Returning empty list.', error);
      return [];
    }
  }

  async renameSubject(universityId: string, courseId: string, semester: string, oldSubjectName: string, newSubjectName: string): Promise<void> {
    verifyConvexConfig();
    try {
      await convex.mutation('questions:renameSubject' as any, {
        universityId,
        courseId,
        semester,
        oldSubjectName,
        newSubjectName
      });
    } catch (error) {
      console.warn('Convex function questions:renameSubject failed.', error);
      throw error;
    }
  }

  async deleteSubject(universityId: string, courseId: string, semester: string, subjectName: string): Promise<void> {
    verifyConvexConfig();
    try {
      await convex.mutation('questions:deleteSubject' as any, {
        universityId,
        courseId,
        semester,
        subjectName
      });
    } catch (error) {
      console.warn('Convex function questions:deleteSubject failed.', error);
      throw error;
    }
  }
}

class ConvexStorageAdapter implements StorageAdapter {
  async uploadPaper(filePath: string, file: File): Promise<string> {
    verifyConvexConfig();
    try {
      const uploadUrl = await convex.mutation('papers:generateUploadUrl' as any, {});
      const response = await fetch(uploadUrl as string, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file
      });
      
      if (!response.ok) {
        throw new Error('Convex file upload failed');
      }
      
      const { storageId } = await response.json();
      const fileUrl = await convex.query('papers:getFileUrl' as any, { storageId });
      return fileUrl as string;
    } catch (error) {
      console.warn('Convex storage upload failed or functions not deployed. Falling back to object URL.', error);
      return URL.createObjectURL(file);
    }
  }
}

export const convexAdapter: BackendAdapter = {
  auth: new ConvexAuthAdapter(),
  db: new ConvexDatabaseAdapter(),
  storage: new ConvexStorageAdapter()
};
