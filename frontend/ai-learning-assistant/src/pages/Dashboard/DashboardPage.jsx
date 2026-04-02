import React, { useState, useEffect } from 'react';
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService'; 
import toast from 'react-hot-toast';
import { FileText, BookOpen, BrainCircuit, TrendingUp, Clock } from 'lucide-react';

const DashboardPage = () => {

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboard();
        setDashboardData(data.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
    
  if (loading) {
    return <Spinner />;
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-sm">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Documents',
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: 'from-blue-400 to-cyan-500',
      shadowColor: 'shadow-blue-500/25',
    },
    {
      label: 'Total Flashcards',
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: 'from-purple-400 to-pink-500',
      shadowColor: 'shadow-purple-500/25'
    },
    {
      label: 'Total Quizzes',
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: 'from-orange-400 to-red-500',
      shadowColor: 'shadow-orange-500/25'
    }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track your learning progress and activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {stat.label}
              </span>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm shadow-orange-500/25">
            <Clock className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Recent Activity
          </h3>
        </div>

        {dashboardData.recentActivity && (dashboardData.recentActivity.documents.length > 0 || dashboardData.recentActivity.quizzes.length > 0) ? (
          <div className="space-y-3">
            {[
              ...(dashboardData.recentActivity.documents || []).map(doc => ({
                id: doc._id,
                description: doc.title,
                timestamp: doc.uploadDate,
                link: `/documents/${doc._id}`,
                type: 'document'
              })),
              ...(dashboardData.recentActivity.quizzes || []).map(quiz => ({
                id: quiz._id,
                description: quiz.title,
                timestamp: quiz.completedAt,
                link: `/quizzes/${quiz._id}`,
                type: 'quiz'
              }))
            ]
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-orange-50 hover:border-orange-100 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'document' 
                      ? 'bg-blue-400'
                      : 'bg-orange-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {activity.type === 'document' ? 'Accessed Document: ' : 'Attempted Quiz: '}
                        <span className="text-orange-500">{activity.description}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Invalid Date'}
                      </p>
                    </div>
                  </div>
                  {activity.link && (
                    <a 
                      href={activity.link}
                      className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors duration-200"
                    >
                      View
                    </a>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 mb-4">
              <Clock className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-600 text-sm font-medium">No recent activity yet.</p>
            <p className="text-slate-400 text-xs mt-1">Start learning to see your progress here!</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default DashboardPage;