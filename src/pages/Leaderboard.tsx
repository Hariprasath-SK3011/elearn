import React, { useEffect, useState } from 'react';
import { Trophy, Award, Clock, TrendingUp, Medal } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardUser {
  id: string;
  full_name: string;
  total_score: number;
  completed_courses: number;
  certificates: number;
  avg_completion_time: number;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'courses' | 'certificates'>('score');

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // This would be a complex query in a real app, combining multiple tables
      // For this example, we'll simulate the data structure
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select(`
          user_id,
          score,
          completed,
          completed_at,
          users!inner(id, full_name)
        `)
        .eq('completed', true);

      if (progressError) throw progressError;

      const { data: certificatesData, error: certificatesError } = await supabase
        .from('certificates')
        .select('user_id');

      if (certificatesError) throw certificatesError;

      // Process the data to create leaderboard entries
      const userStats: { [key: string]: LeaderboardUser } = {};

      progressData?.forEach((progress: any) => {
        const userId = progress.user_id;
        const userName = progress.users.full_name;
        
        if (!userStats[userId]) {
          userStats[userId] = {
            id: userId,
            full_name: userName,
            total_score: 0,
            completed_courses: 0,
            certificates: 0,
            avg_completion_time: 0,
          };
        }

        userStats[userId].total_score += progress.score || 0;
        userStats[userId].completed_courses += 1;
      });

      // Add certificate counts
      const certificateCounts: { [key: string]: number } = {};
      certificatesData?.forEach((cert: any) => {
        certificateCounts[cert.user_id] = (certificateCounts[cert.user_id] || 0) + 1;
      });

      Object.keys(userStats).forEach(userId => {
        userStats[userId].certificates = certificateCounts[userId] || 0;
        userStats[userId].total_score = Math.round(
          userStats[userId].total_score / userStats[userId].completed_courses
        );
      });

      const leaderboardUsers = Object.values(userStats)
        .filter(user => user.completed_courses > 0)
        .sort((a, b) => {
          switch (sortBy) {
            case 'courses':
              return b.completed_courses - a.completed_courses;
            case 'certificates':
              return b.certificates - a.certificates;
            default:
              return b.total_score - a.total_score;
          }
        });

      setUsers(leaderboardUsers);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sortedUsers = [...users].sort((a, b) => {
      switch (sortBy) {
        case 'courses':
          return b.completed_courses - a.completed_courses;
        case 'certificates':
          return b.certificates - a.certificates;
        default:
          return b.total_score - a.total_score;
      }
    });
    setUsers(sortedUsers);
  }, [sortBy]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</div>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">
            See how you rank against other learners in the community
          </p>
        </div>

        {/* Sort Options */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-gray-700 font-medium">Sort by:</span>
            
            <button
              onClick={() => setSortBy('score')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                sortBy === 'score'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Average Score</span>
            </button>
            
            <button
              onClick={() => setSortBy('courses')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                sortBy === 'courses'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Completed Courses</span>
            </button>
            
            <button
              onClick={() => setSortBy('certificates')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                sortBy === 'certificates'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Certificates</span>
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {users.length > 0 ? (
            users.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${getRankBg(index + 1)}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                      <p className="text-sm text-gray-600">Rank #{index + 1}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{user.total_score}%</div>
                    <div className="text-xs text-gray-600">Avg Score</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{user.completed_courses}</div>
                    <div className="text-xs text-gray-600">Courses</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{user.certificates}</div>
                    <div className="text-xs text-gray-600">Certificates</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings yet</h3>
                <p className="text-gray-600">
                  Complete some courses and quizzes to appear on the leaderboard!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Community Stats</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {users.length}
              </div>
              <div className="text-gray-600">Active Learners</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {users.reduce((sum, user) => sum + user.completed_courses, 0)}
              </div>
              <div className="text-gray-600">Total Completions</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {users.reduce((sum, user) => sum + user.certificates, 0)}
              </div>
              <div className="text-gray-600">Certificates Earned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;