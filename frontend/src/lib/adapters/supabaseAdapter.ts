import supabase from '../supabase';
import { 
  BackendAdapter, 
  AuthAdapter, 
  DatabaseAdapter, 
  StorageAdapter,
  AppUser,
  UserProfile,
  PaperRecord
} from './types';

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  }
  return supabase;
}

class SupabaseAuthAdapter implements AuthAdapter {
  async getCurrentUser(): Promise<AppUser | null> {
    const client = getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();
    return user ? { id: user.id, email: user.email || null } : null;
  }

  onAuthStateChange(callback: (user: AppUser | null) => void): () => void {
    const client = getSupabaseClient();
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? { id: session.user.id, email: session.user.email || null } : null);
    });
    return () => subscription.unsubscribe();
  }

  async signInWithEmail(email: string, password: string): Promise<AppUser> {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error('Failed to retrieve user data');
    return { id: data.user.id, email: data.user.email || null };
  }

  async logout(): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }
}

class SupabaseDatabaseAdapter implements DatabaseAdapter {
  async getQuestions(
    universityId: string, 
    courseId: string, 
    semester: string, 
    subjectName: string
  ): Promise<string> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('questions')
      .select('*')
      .eq('university_id', universityId)
      .eq('course_id', courseId)
      .eq('semester', semester)
      .eq('subject_name', subjectName);

    if (error) throw error;
    return data && data.length > 0 ? (data[0].content || '') : '';
  }

  async upsertQuestions(
    universityId: string, 
    courseId: string, 
    semester: string, 
    subjectName: string, 
    content: string
  ): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client
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
    if (error) throw error;
  }

  async getProfile(email: string): Promise<UserProfile | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('profiles')
      .select('full_name, role, university_id, course_id')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(email: string, profile: Partial<UserProfile>): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client
      .from('profiles')
      .upsert({
        email,
        ...profile,
        updated_at: new Date().toISOString()
      });
    if (error) throw error;
  }

  async createPaper(paper: Omit<PaperRecord, 'id'>): Promise<{ id: string | number; [key: string]: any }> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('papers')
      .insert(paper)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSemesterSubjects(universityId: string, courseId: string, semester: string): Promise<string[]> {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('questions')
        .select('subject_name')
        .eq('university_id', universityId)
        .eq('course_id', courseId)
        .eq('semester', semester);

      if (error) throw error;
      if (!data) return [];
      const subjects = data.map(q => q.subject_name).filter(Boolean);
      return Array.from(new Set(subjects));
    } catch (error) {
      console.warn('Supabase query getSemesterSubjects failed. Returning empty list.', error);
      return [];
    }
  }

  async renameSubject(universityId: string, courseId: string, semester: string, oldSubjectName: string, newSubjectName: string): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client
      .from('questions')
      .update({ subject_name: newSubjectName, updated_at: new Date().toISOString() })
      .eq('university_id', universityId)
      .eq('course_id', courseId)
      .eq('semester', semester)
      .eq('subject_name', oldSubjectName);
    if (error) throw error;
  }

  async deleteSubject(universityId: string, courseId: string, semester: string, subjectName: string): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client
      .from('questions')
      .delete()
      .eq('university_id', universityId)
      .eq('course_id', courseId)
      .eq('semester', semester)
      .eq('subject_name', subjectName);
    if (error) throw error;
  }
}

class SupabaseStorageAdapter implements StorageAdapter {
  async uploadPaper(filePath: string, file: File): Promise<string> {
    const client = getSupabaseClient();
    const { data, error } = await client.storage
      .from('edupapers')
      .upload(filePath, file);

    if (error) throw error;
    if (!data) throw new Error('Failed to upload file to storage');

    const { data: urlData } = client.storage
      .from('edupapers')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }

    return urlData.publicUrl;
  }
}

export const supabaseAdapter: BackendAdapter = {
  auth: new SupabaseAuthAdapter(),
  db: new SupabaseDatabaseAdapter(),
  storage: new SupabaseStorageAdapter()
};
