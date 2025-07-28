import { create } from 'zustand';
import { supabase, type Course, type Lesson, type UserProgress } from '../lib/supabase';

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  lessons: Lesson[];
  userProgress: UserProgress[];
  loading: boolean;
  fetchCourses: () => Promise<void>;
  fetchCourse: (id: string) => Promise<void>;
  fetchLessons: (courseId: string) => Promise<void>;
  fetchUserProgress: (userId: string, courseId?: string) => Promise<void>;
  updateProgress: (userId: string, courseId: string, lessonId: string, completed: boolean, score?: number) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  currentCourse: null,
  lessons: [],
  userProgress: [],
  loading: false,

  fetchCourses: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:users!courses_instructor_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const coursesWithInstructor = data?.map(course => ({
        ...course,
        instructor_name: course.instructor?.full_name || 'Unknown',
      })) || [];

      set({ courses: coursesWithInstructor });
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchCourse: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:users!courses_instructor_id_fkey(full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      set({ 
        currentCourse: {
          ...data,
          instructor_name: data.instructor?.full_name || 'Unknown',
        }
      });
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  },

  fetchLessons: async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order');

      if (error) throw error;
      set({ lessons: data || [] });
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  },

  fetchUserProgress: async (userId: string, courseId?: string) => {
    try {
      let query = supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ userProgress: data || [] });
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  },

  updateProgress: async (userId: string, courseId: string, lessonId: string, completed: boolean, score?: number) => {
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          completed,
          score,
          completed_at: completed ? new Date().toISOString() : null,
        });

      if (error) throw error;

      // Refresh progress
      await get().fetchUserProgress(userId, courseId);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  },
}));