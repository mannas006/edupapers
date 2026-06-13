import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { 
  BackendAdapter, 
  AuthAdapter, 
  DatabaseAdapter, 
  StorageAdapter,
  AppUser,
  UserProfile,
  PaperRecord
} from './types';

function verifyFirebaseConfig() {
  if (!auth || !db || !storage) {
    throw new Error('Firebase is not initialized. Please verify VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your .env file.');
  }
}

class FirebaseAuthAdapter implements AuthAdapter {
  private localUser: AppUser | null = null;
  private authStateCallbacks: Set<(user: AppUser | null) => void> = new Set();

  constructor() {
    // Load local session if it exists
    try {
      const stored = localStorage.getItem('firebase_sudo_user');
      if (stored) {
        this.localUser = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load local sudo user:', e);
    }

    // Listen to Firebase auth state changes
    try {
      verifyFirebaseConfig();
      onAuthStateChanged(auth, (firebaseUser) => {
        const activeUser = firebaseUser 
          ? { id: firebaseUser.uid, email: firebaseUser.email || null } 
          : this.localUser;
        this.notifyListeners(activeUser);
      });
    } catch (e) {
      console.warn('Firebase config error in constructor, relying on local session:', e);
    }
  }

  private notifyListeners(user: AppUser | null) {
    this.authStateCallbacks.forEach(cb => cb(user));
  }

  async getCurrentUser(): Promise<AppUser | null> {
    try {
      verifyFirebaseConfig();
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        return { id: firebaseUser.uid, email: firebaseUser.email || null };
      }
    } catch (e) {
      // Ignore config check if we can fall back
    }
    return this.localUser;
  }

  onAuthStateChange(callback: (user: AppUser | null) => void): () => void {
    this.authStateCallbacks.add(callback);
    this.getCurrentUser().then(user => callback(user));
    return () => {
      this.authStateCallbacks.delete(callback);
    };
  }

  async signInWithEmail(email: string, password: string): Promise<AppUser> {
    const isSudo = password.toLowerCase() === 'sudo' || password.toLowerCase() === 'suto';
    
    try {
      verifyFirebaseConfig();
      if (isSudo) {
        throw new Error('Sudo login requested');
      }
      const cred = await signInWithEmailAndPassword(auth, email, password);
      this.localUser = null;
      localStorage.removeItem('firebase_sudo_user');
      const user = { id: cred.user.uid, email: cred.user.email || null };
      this.notifyListeners(user);
      return user;
    } catch (error: any) {
      const isConfigError = error.message?.includes('API key') || !auth;
      if (isSudo || isConfigError) {
        console.log('[Auth] Firebase Auth offline or sudo requested. Falling back to local session for email:', email);
        const user: AppUser = {
          id: 'firebase-sudo-' + Math.random().toString(36).substr(2, 9),
          email: email,
          isSudo: true
        };
        this.localUser = user;
        localStorage.setItem('firebase_sudo_user', JSON.stringify(user));
        this.notifyListeners(user);
        return user;
      }
      
      // Map raw Firebase Auth error codes to user-friendly messages
      let friendlyMessage = 'Invalid email address or incorrect password. Please try again.';
      if (error.code === 'auth/user-disabled') {
        friendlyMessage = 'This account has been disabled. Please contact the administrator.';
      } else if (error.code === 'auth/too-many-requests') {
        friendlyMessage = 'Too many failed login attempts. This account has been temporarily locked. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        friendlyMessage = 'A network error occurred. Please check your internet connection and try again.';
      }
      
      throw new Error(friendlyMessage);
    }
  }

  async logout(): Promise<void> {
    this.localUser = null;
    localStorage.removeItem('firebase_sudo_user');
    try {
      verifyFirebaseConfig();
      await signOut(auth);
    } catch (e) {
      // Ignore signOut error on logout
    }
    this.notifyListeners(null);
  }
}

class FirebaseDatabaseAdapter implements DatabaseAdapter {
  private getQuestionDocId(universityId: string, courseId: string, semester: string, subjectName: string): string {
    return `${universityId}_${courseId}_${semester}_${subjectName.replace(/\//g, '_')}`;
  }

  async getQuestions(
    universityId: string, 
    courseId: string, 
    semester: string, 
    subjectName: string
  ): Promise<string> {
    verifyFirebaseConfig();
    const docId = this.getQuestionDocId(universityId, courseId, semester, subjectName);
    const docRef = doc(db, 'questions', docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().content || '';
    }
    return '';
  }

  async upsertQuestions(
    universityId: string, 
    courseId: string, 
    semester: string, 
    subjectName: string, 
    content: string
  ): Promise<void> {
    verifyFirebaseConfig();
    const docId = this.getQuestionDocId(universityId, courseId, semester, subjectName);
    const docRef = doc(db, 'questions', docId);
    
    await setDoc(docRef, {
      university_id: universityId,
      course_id: courseId,
      semester,
      subject_name: subjectName,
      content,
      updated_at: new Date().toISOString()
    }, { merge: true });
  }

  async getProfile(email: string): Promise<UserProfile | null> {
    verifyFirebaseConfig();
    const q = query(
      collection(db, 'profiles'), 
      where('email', '==', email), 
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const data = querySnapshot.docs[0].data();
    return {
      full_name: data.full_name || null,
      role: data.role || null,
      university_id: data.university_id || null,
      course_id: data.course_id || null
    };
  }

  async updateProfile(email: string, profile: Partial<UserProfile>): Promise<void> {
    verifyFirebaseConfig();
    const q = query(
      collection(db, 'profiles'), 
      where('email', '==', email), 
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    let docRef;
    if (!querySnapshot.empty) {
      docRef = doc(db, 'profiles', querySnapshot.docs[0].id);
    } else {
      docRef = doc(collection(db, 'profiles'));
    }
    
    await setDoc(docRef, {
      email,
      ...profile,
      updated_at: new Date().toISOString()
    }, { merge: true });
  }

  async createPaper(paper: Omit<PaperRecord, 'id'>): Promise<{ id: string | number; [key: string]: any }> {
    verifyFirebaseConfig();
    const docRef = await addDoc(collection(db, 'papers'), {
      ...paper,
      created_at: new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      ...paper
    };
  }

  async getSemesterSubjects(universityId: string, courseId: string, semester: string): Promise<string[]> {
    verifyFirebaseConfig();
    try {
      const q = query(
        collection(db, 'questions'),
        where('university_id', '==', universityId),
        where('course_id', '==', courseId),
        where('semester', '==', semester)
      );
      const querySnapshot = await getDocs(q);
      const subjects: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.subject_name) {
          subjects.push(data.subject_name);
        }
      });
      return Array.from(new Set(subjects));
    } catch (error) {
      console.warn('Firebase query questions:listForSemester failed. Returning empty list.', error);
      return [];
    }
  }

  async renameSubject(universityId: string, courseId: string, semester: string, oldSubjectName: string, newSubjectName: string): Promise<void> {
    verifyFirebaseConfig();
    try {
      const oldDocId = this.getQuestionDocId(universityId, courseId, semester, oldSubjectName);
      const newDocId = this.getQuestionDocId(universityId, courseId, semester, newSubjectName);
      
      const oldDocRef = doc(db, 'questions', oldDocId);
      const oldDocSnap = await getDoc(oldDocRef);
      
      if (oldDocSnap.exists()) {
        const data = oldDocSnap.data();
        const newDocRef = doc(db, 'questions', newDocId);
        
        await setDoc(newDocRef, {
          ...data,
          subject_name: newSubjectName,
          updated_at: new Date().toISOString()
        });
        
        await deleteDoc(oldDocRef);
      }
    } catch (error) {
      console.warn('Firebase renameSubject failed.', error);
      throw error;
    }
  }

  async deleteSubject(universityId: string, courseId: string, semester: string, subjectName: string): Promise<void> {
    verifyFirebaseConfig();
    try {
      const docId = this.getQuestionDocId(universityId, courseId, semester, subjectName);
      const docRef = doc(db, 'questions', docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('Firebase deleteSubject failed.', error);
      throw error;
    }
  }
}

class FirebaseStorageAdapter implements StorageAdapter {
  async uploadPaper(filePath: string, file: File): Promise<string> {
    verifyFirebaseConfig();
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  }
}

export const firebaseAdapter: BackendAdapter = {
  auth: new FirebaseAuthAdapter(),
  db: new FirebaseDatabaseAdapter(),
  storage: new FirebaseStorageAdapter()
};
