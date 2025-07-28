import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCourseStore } from '../store/useCourseStore';
import { supabase } from '../lib/supabase';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  Trophy,
  Clock
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses, userProgress, fetchUserProgress } = useCourseStore();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalCertificates: 0,
    averageScore: 0
  });

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchUserProgress(user.id);
      fetchCertificates();
    }
  }, [user]);

  useEffect(() => {
    if (courses.length > 0 && userProgress.length > 0) {
      calculateStats();
    }
  }, [courses, userProgress]);

  const fetchCertificates = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const calculateStats = () => {
    const enrolledCourses = new Set(userProgress.map(p => p.course_id));
    const completedCourses = new Set();
    let totalScore = 0;
    let scoreCount = 0;

    // Group progress by course
    const courseProgress: { [key: string]: any[] } = {};
    userProgress.forEach(progress => {
      if (!courseProgress[progress.course_id]) {
        courseProgress[progress.course_id] = [];
      }
      courseProgress[progress.course_id].push(progress);
    });

    // Check completion and calculate average score
    Object.entries(courseProgress).forEach(([courseId, progresses]) => {
      const courseComplete = progresses.every(p => p.completed);
      if (courseComplete) {
        completedCourses.add(courseId);
      }

      progresses.forEach(p => {
        if (p.score) {
          totalScore += p.score;
          scoreCount++;
        }
      });
    });

    setStats({
      totalCourses: enrolledCourses.size,
      completedCourses: completedCourses.size,
      totalCertificates: certificates.length,
      averageScore: scoreCount > 0 ? totalScore / scoreCount : 0
    });
  };

  const getRecentActivity = () => {
    return userProgress
      .filter(p => p.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
      .slice(0, 5);
  };

  const getInProgressCourses = () => {
    const inProgress = new Set<string>();
    const completed = new Set<string>();

    // Group by course
    const courseProgress: { [key: string]: any[] } = {};
    userProgress.forEach(progress => {
      if (!courseProgress[progress.course_id]) {
        courseProgress[progress.course_id] = [];
      }
      courseProgress[progress.course_id].push(progress);
    });

    Object.entries(courseProgress).forEach(([courseId, progresses]) => {
      if (progresses.some(p => p.completed)) {
        if (progresses.every(p => p.completed)) {
          completed.add(courseId);
        } else {
          inProgress.add(courseId);
        }
      }
    });

    return courses.filter(course => inProgress.has(course.id)).slice(0, 3);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.full_name}!
          </h1>
          <p className="text-gray-600">
            Continue your learning journey and track your progress.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageScore)}%</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Continue Learning</h2>
              
              {getInProgressCourses().length > 0 ? (
                <div className="space-y-4">
                  {getInProgressCourses().map(course => (
                    <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-600">{course.instructor_name}</p>
                        </div>
                      </div>
                      <Link
                        to={`/courses/${course.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      >
                        Continue
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses in progress</h3>
                  <p className="text-gray-600 mb-4">Start learning by browsing our course catalog.</p>
                  <Link
                    to="/courses"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              
              {getRecentActivity().length > 0 ? (
                <div className="space-y-3">
                  {getRecentActivity().map(activity => {
                    const course = courses.find(c => c.id === activity.course_id);
                    return (
                      <div key={activity.id} className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">
                          Completed lesson in <span className="font-medium">{course?.title}</span>
                        </span>
                        <span className="text-gray-400">
                          {new Date(activity.completed_at!).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">No recent activity to show.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link
                  to="/courses"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>Browse Courses</span>
                </Link>
                
                <Link
                  to="/leaderboard"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span>View Leaderboard</span>
                </Link>
                
                <Link
                  to="/chat"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Join Discussions</span>
                </Link>
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Certificates</h2>
              
              {certificates.length > 0 ? (
                <div className="space-y-3">
                  {certificates.slice(0, 3).map(cert => (
                    <div key={cert.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{cert.course_title}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(cert.issued_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {certificates.length > 3 && (
                    <Link
                      to="/certificates"
                      className="block text-center text-blue-600 hover:text-blue-700 text-sm"
                    >
                      View all certificates
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No certificates earned yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;