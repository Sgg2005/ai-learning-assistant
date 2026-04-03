import React, { useState, useEffect } from 'react';
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService';
import toast from 'react-hot-toast';
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Target,
  Zap,
  FolderOpen,
  ClipboardList
} from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-sm">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  const totalDocuments = dashboardData.overview.totalDocuments || 0;
  const totalFlashcards = dashboardData.overview.totalFlashcards || 0;
  const totalQuizzes = dashboardData.overview.totalQuizzes || 0;

  const totalResources = totalDocuments + totalFlashcards + totalQuizzes;
  const weeklyGoal = 10;
  const weeklyProgress = Math.min(totalResources, weeklyGoal);
  const progressPercentage = Math.min((weeklyProgress / weeklyGoal) * 100, 100);

  const stats = [
    {
      label: 'Total Documents',
      value: totalDocuments,
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      subtext: 'Your uploaded study materials'
    },
    {
      label: 'Total Flashcards',
      value: totalFlashcards,
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      subtext: 'Cards generated for revision'
    },
    {
      label: 'Total Quizzes',
      value: totalQuizzes,
      icon: BrainCircuit,
      gradient: 'from-orange-500 to-red-500',
      bg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      subtext: 'Quizzes completed or created'
    }
  ];

  const recentActivities = [
    ...(dashboardData.recentActivity?.documents || []).map((doc) => ({
      id: doc._id,
      description: doc.title,
      timestamp: doc.uploadDate,
      link: `/documents/${doc._id}`,
      type: 'document'
    })),
    ...(dashboardData.recentActivity?.quizzes || []).map((quiz) => ({
      id: quiz._id,
      description: quiz.title,
      timestamp: quiz.completedAt,
      link: `/quizzes/${quiz._id}`,
      type: 'quiz'
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const aiSuggestions = [
    {
      title: 'Generate flashcards from your latest document',
      description: 'Turn your uploaded notes into quick revision cards.',
      icon: Sparkles
    },
    {
      title: 'Create a quiz to test your understanding',
      description: 'Use AI to build a short quiz from your learning material.',
      icon: BrainCircuit
    },
    {
      title: 'Track weak areas and revise smarter',
      description: 'Focus on the topics where you need the most improvement.',
      icon: Target
    }
  ];

  const quickActions = [
    {
      label: 'Upload Document',
      href: '/documents',
      icon: FolderOpen,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Open Flashcards',
      href: '/flashcards',
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Start Quiz',
      href: '/quizzes',
      icon: ClipboardList,
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track your learning progress, activity, and AI-powered study support
        </p>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-orange-500 p-8 mb-8 shadow-lg">
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-300/20 rounded-full blur-2xl translate-y-10 -translate-x-8" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium mb-4 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              AI Learning Assistant
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back 👋
            </h2>
            <p className="text-white/80 text-sm md:text-base mt-2 max-w-xl">
              You currently have <span className="font-semibold text-white">{totalResources}</span>{' '}
              learning resources in your workspace. Keep building your study system
              and let AI help you revise faster.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 min-w-[280px] border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-medium">Weekly Learning Goal</p>
              <span className="text-xs text-white/80">
                {weeklyProgress}/{weeklyGoal}
              </span>
            </div>

            <div className="w-full h-3 bg-white/15 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <p className="text-xs text-white/75">
              {progressPercentage >= 100
                ? 'Great job — your weekly goal is complete.'
                : 'Keep going — you are making steady progress.'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-slate-900 mt-3">{stat.value}</h3>
              </div>

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
            </div>

            <p className="text-sm text-slate-500">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* AI Suggestions */}
        <div className="xl:col-span-2 bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">AI Suggestions</h3>
              <p className="text-sm text-slate-500">
                Smart actions to help you study more effectively
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {aiSuggestions.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                  </div>
                </div>

                <button className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
                  Try now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
              <p className="text-sm text-slate-500">Jump into your next task</p>
            </div>
          </div>

          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-800">{action.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
            <p className="text-sm text-slate-500">
              Your latest learning interactions
            </p>
          </div>
        </div>

        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      activity.type === 'document'
                        ? 'bg-blue-100'
                        : 'bg-orange-100'
                    }`}
                  >
                    {activity.type === 'document' ? (
                      <FileText className="w-5 h-5 text-blue-600" />
                    ) : (
                      <BrainCircuit className="w-5 h-5 text-orange-600" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {activity.type === 'document' ? 'Accessed Document' : 'Attempted Quiz'}
                    </p>
                    <p className="text-sm text-slate-600">{activity.description}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {activity.timestamp
                        ? new Date(activity.timestamp).toLocaleString()
                        : 'Invalid Date'}
                    </p>
                  </div>
                </div>

                {activity.link && (
                  <a
                    href={activity.link}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    View
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-14">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-slate-100 mb-4">
              <Clock className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-700 text-sm font-semibold">No recent activity yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Start uploading documents, creating flashcards, or taking quizzes to see activity here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;