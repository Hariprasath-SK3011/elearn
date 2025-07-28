import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Hash } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCourseStore } from '../store/useCourseStore';
import { supabase } from '../lib/supabase';
import ChatInterface from '../components/Chat/ChatInterface';

const Chat: React.FC = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [selectedChat, setSelectedChat] = useState<{
    type: 'course' | 'direct';
    id: string;
    title: string;
  } | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, role')
        .neq('id', user?.id);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Filter courses that user is enrolled in
  const enrolledCourses = courses.filter(course => {
    // In a real app, you'd check enrollment status
    return true; // For demo, show all courses
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Messages</h2>
            
            {/* Course Discussions */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Course Discussions
              </h3>
              <div className="space-y-2">
                {enrolledCourses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedChat({
                      type: 'course',
                      id: course.id,
                      title: course.title
                    })}
                    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                      selectedChat?.id === course.id && selectedChat?.type === 'course'
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-sm">{course.title}</div>
                        <div className="text-xs text-gray-500">{course.instructor_name}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Messages */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Direct Messages
              </h3>
              <div className="space-y-2">
                {users.map(otherUser => (
                  <button
                    key={otherUser.id}
                    onClick={() => setSelectedChat({
                      type: 'direct',
                      id: otherUser.id,
                      title: otherUser.full_name
                    })}
                    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                      selectedChat?.id === otherUser.id && selectedChat?.type === 'direct'
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {otherUser.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{otherUser.full_name}</div>
                        <div className="text-xs text-gray-500 capitalize">{otherUser.role}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedChat ? (
              <ChatInterface
                courseId={selectedChat.type === 'course' ? selectedChat.id : undefined}
                receiverId={selectedChat.type === 'direct' ? selectedChat.id : undefined}
                title={selectedChat.title}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Chat</h3>
                  <p className="text-gray-600 mb-6">
                    Select a course discussion or start a direct message to begin chatting.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Hash className="h-4 w-4" />
                      <span className="text-sm">Join course discussions</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Connect with learners</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;