import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type User = {
  id: string;
  email: string;
  role: 'admin' | 'instructor' | 'learner';
  full_name: string;
  avatar_url?: string;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order: number;
  type: 'article' | 'quiz';
  created_at: string;
};

export type Quiz = {
  id: string;
  lesson_id: string;
  questions: QuizQuestion[];
  passing_score: number;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  points: number;
};

export type UserProgress = {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  score?: number;
  completed_at?: string;
};

export type Certificate = {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  user_name: string;
  issued_at: string;
  certificate_url: string;
};

export type Message = {
  id: string;
  sender_id: string;
  sender_name: string;
  receiver_id?: string;
  course_id?: string;
  content: string;
  created_at: string;
};