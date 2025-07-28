import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, User, BookOpen, Award, Play, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuthStore } from '../store/useAuthStore';
import { useCourseStore } from '../store/useCourseStore';
import { supabase, Quiz } from '../lib/supabase';
import QuizComponent from '../components/Quiz/QuizComponent';
import { generateCertificate } from '../utils/certificateGenerator';
import toast from 'react-hot-toast';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentCourse, 
    lessons, 
    userProgress, 
    fetchCourse, 
    fetchLessons, 
    fetchUserProgress,
    updateProgress 
  } = useCourseStore();
  
  const [activeLesson, setActiveLesson] = useState<number>(0);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse(id);
      fetchLessons(id);
      if (user) {
        fetchUserProgress(user.id, id);
        checkEnrollment();
      }
    }
  }, [id, user]);

  useEffect(() => {
    if (lessons.length > 0 && userProgress.length > 0) {
      // Find first incomplete lesson
      const firstIncomplete = lessons.findIndex(lesson => 
        !userProgress.some(p => p.lesson_id === lesson.id && p.completed)
      );
      if (firstIncomplete !== -1) {
        setActiveLesson(firstIncomplete);
      }
    }
  }, [lessons, userProgress]);

  const checkEnrollment = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .single();

      setEnrolled(!!data);
    } catch (error) {
      setEnrolled(false);
    }
  };

  const handleEnroll = async () => {
    if (!user || !id) return;

    try {
      const { error } = await supabase
        .from('enrollments')
        .insert([{
          user_id: user.id,
          course_id: id,
        }]);

      if (error) throw error;
      
      setEnrolled(true);
      toast.success('Successfully enrolled in course!');
      
      // Refresh progress
      fetchUserProgress(user.id, id);
    } catch (error) {
      toast.error('Failed to enroll in course');
    }
  };

  const handleLessonComplete = async () => {
    if (!user || !id || !lessons[activeLesson]) return;

    const lesson = lessons[activeLesson];
    await updateProgress(user.id, id, lesson.id, true);
    
    // Check if course is complete
    const allLessonsCompleted = lessons.every(l => 
      userProgress.some(p => p.lesson_id === l.id && p.completed) || l.id === lesson.id
    );

    if (allLessonsCompleted) {
      await generateCourseCertificate();
    }

    toast.success('Lesson completed!');
  };

  const loadQuiz = async (lessonId: string) => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .single();

      if (error) throw error;
      setQuiz(data);
      setShowQuiz(true);
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Quiz not available');
    }
  };

  const handleQuizComplete = async (score: number, passed: boolean) => {
    if (!user || !id || !lessons[activeLesson]) return;

    const lesson = lessons[activeLesson];
    await updateProgress(user.id, id, lesson.id, passed, score);
    
    if (passed) {
      toast.success(`Quiz completed with ${Math.round(score)}%!`);
      setShowQuiz(false);
      
      // Check if course is complete
      const allLessonsCompleted = lessons.every(l => 
        userProgress.some(p => p.lesson_id === l.id && p.completed) || l.id === lesson.id
      );

      if (allLessonsCompleted) {
        await generateCourseCertificate();
      }
    } else {
      toast.error(`Quiz not passed. ${Math.round(score)}% (70% required)`);
    }
  };

  const generateCourseCertificate = async () => {
    if (!user || !currentCourse) return;

    try {
      const certificateData = {
        userName: user.full_name,
        courseName: currentCourse.title,
        completionDate: new Date().toLocaleDateString(),
        instructorName: currentCourse.instructor_name
      };

      const certificateUrl = generateCertificate(certificateData);
      
      // Save certificate to database
      const { error } = await supabase
        .from('certificates')
        .insert([{
          user_id: user.id,
          course_id: currentCourse.id,
          course_title: currentCourse.title,
          user_name: user.full_name,
          certificate_url: certificateUrl,
        }]);

      if (error) throw error;

      toast.success('🎉 Congratulations! Certificate generated!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to generate certificate');
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getProgressPercentage = () => {
    if (lessons.length === 0) return 0;
    const completed = lessons.filter(l => isLessonCompleted(l.id)).length;
    return (completed / lessons.length) * 100;
  };

  if (!currentCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  const currentLesson = lessons[activeLesson];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentCourse.title}</h1>
              <p className="text-gray-600 mb-6">{currentCourse.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{currentCourse.instructor_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{lessons.length} lessons</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Self-paced</span>
                </div>
              </div>

              {enrolled && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Course Progress</span>
                    <span>{Math.round(getProgressPercentage())}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>
              )}

              {!enrolled ? (
                <button
                  onClick={handleEnroll}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Enroll in Course
                </button>
              ) : getProgressPercentage() === 100 ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Award className="h-5 w-5" />
                  <span className="font-medium">Course Completed!</span>
                </div>
              ) : null}
            </div>

            <div className="lg:w-80 mt-6 lg:mt-0">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Course Content</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(index)}
                      disabled={!enrolled}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                        activeLesson === index
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : enrolled
                          ? 'bg-white hover:bg-gray-50 border border-gray-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {lesson.type === 'quiz' ? (
                            <Award className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">{lesson.title}</span>
                        </div>
                        {isLessonCompleted(lesson.id) && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        {enrolled && currentLesson && !showQuiz && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">{currentLesson.title}</h2>
              {!isLessonCompleted(currentLesson.id) && (
                <button
                  onClick={currentLesson.type === 'quiz' 
                    ? () => loadQuiz(currentLesson.id)
                    : handleLessonComplete
                  }
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  {currentLesson.type === 'quiz' ? 'Take Quiz' : 'Mark Complete'}
                </button>
              )}
            </div>

            {currentLesson.type === 'article' ? (
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentLesson.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz Ready</h3>
                <p className="text-gray-600 mb-4">Test your knowledge with this quiz.</p>
                <button
                  onClick={() => loadQuiz(currentLesson.id)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Start Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quiz Component */}
        {showQuiz && quiz && (
          <QuizComponent
            quiz={quiz}
            onComplete={handleQuizComplete}
          />
        )}

        {!enrolled && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Course Enrollment Required</h3>
            <p className="text-gray-600 mb-6">
              Enroll in this course to access all lessons and track your progress.
            </p>
            <button
              onClick={handleEnroll}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Enroll Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;