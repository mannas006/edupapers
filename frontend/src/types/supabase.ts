export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      },
      papers: {
        Row: {
          id: string
          user_id: string | null
          university: string | null
          course: string | null
          semester: string | null
          file_url: string | null
          file_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          university?: string | null
          course?: string | null
          semester?: string | null
          file_url?: string | null
          file_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          university?: string | null
          course?: string | null
          semester?: string | null
          file_url?: string | null
          file_name?: string | null
          created_at?: string
        }
      },
      questions: {
        Row: {
          id: string
          university_id: string | null
          course_id: string | null
          semester: string | null
          subject_name: string | null
          content: string | null
        }
        Insert: {
          id?: string
          university_id?: string | null
          course_id?: string | null
          semester?: string | null
          subject_name?: string | null
          content?: string | null
        }
        Update: {
          id?: string
          university_id?: string | null
          course_id?: string | null
          semester?: string | null
          subject_name?: string | null
          content?: string | null
        }
      }
    }
  }
}
