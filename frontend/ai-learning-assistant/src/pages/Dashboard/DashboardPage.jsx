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
  ClipboardList,
  Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">No dashboard data available.</p>
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

  const calculateStreak = () => {
    const allTimestamps = [
      ...(dashboardData.recentActivity?.documents || []).map(d => d.uploadDate),
      ...(dashboardData.recentActivity?.quizzes || []).map(q => q.completedAt),
    ].filter(Boolean).map(t => new Date(t).toDateString());

    const uniqueDays = [...new Set(allTimestamps)].map(d => new Date(d)).sort((a, b) => b - a);

    if (uniqueDays.length === 0) return 0;

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (uniqueDays[0].toDateString() !== today && uniqueDays[0].toDateString() !== yesterday) {
      return 0;
    }

    let currentDate = new Date(uniqueDays[0]);
    for (let i = 0; i < uniqueDays.length; i++) {
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - i);
      if (uniqueDays[i].toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  const stats = [
    {
      label: 'Total Documents',
      value: totalDocuments,
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      subtext: 'Your uploaded study materials'
    },
    {
      label: 'Total Flashcards',
      value: totalFlashcards,
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500',
      subtext: 'Cards generated for revision'
    },
    {
      label: 'Total Quizzes',
      value: totalQuizzes,
      icon: BrainCircuit,
      gradient: 'from-orange-500 to-red-500',
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
      link: `/quizzes/${quiz._id}/results`,
      type: 'quiz'
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const aiSuggestions = [
    {
      title: 'Generate flashcards from your latest document',
      description: 'Turn your uploaded notes into quick revision cards.',
      icon: Sparkles,
      link: '/flashcards'
    },
    {
      title: 'Create a quiz to test your understanding',
      description: 'Use AI to build a short quiz from your learning material.',
      icon: BrainCircuit,
      link: '/documents'
    },
    {
      title: 'Track weak areas and revise smarter',
      description: 'Focus on the topics where you need the most improvement.',
      icon: Target,
      link: '/documents'
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
      href: '/documents',
      icon: ClipboardList,
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6 transition-colors duration-300">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
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
            <h2 className="text-2xl md:text-3xl font-bold text-white">Welcome back 👋</h2>
            <p className="text-white/80 text-sm md:text-base mt-2 max-w-xl">
              You currently have <span className="font-semibold text-white">{totalResources}</span>{' '}
              learning resources in your workspace. Keep building your study system and let AI help you revise faster.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 min-w-[280px] border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-medium">Weekly Learning Goal</p>
              <span className="text-xs text-white/80">{weeklyProgress}/{weeklyGoal}</span>
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

      {/* Streak Tracker */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm mb-8 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Study Streak</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Keep studying every day to maintain your streak</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10 border border-orange-100 dark:border-orange-500/20">
            <span className="text-4xl font-bold text-orange-500">{streak}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{streak === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {streak === 0 && 'No streak yet — start studying today!'}
              {streak === 1 && 'Great start! Come back tomorrow to keep it going.'}
              {streak >= 2 && streak < 7 && `${streak} days in a row! Keep it up!`}
              {streak >= 7 && streak < 30 && `🔥 ${streak} day streak! You're on fire!`}
              {streak >= 30 && `🏆 ${streak} day streak! Incredible dedication!`}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {streak === 0
                ? 'Upload a document, create flashcards, or complete a quiz to start your streak.'
                : 'Study at least once a day to keep your streak alive.'}
            </p>
            <div className="flex items-center gap-1 sm:gap-1.5 mt-3 flex-wrap">
              {Array.from({ length: 7 }).map((_, i) => {
                const day = new Date();
                day.setDate(day.getDate() - (6 - i));
                const dayStr = day.toDateString();
                const allDays = [
                  ...(dashboardData.recentActivity?.documents || []).map(d => new Date(d.uploadDate).toDateString()),
                  ...(dashboardData.recentActivity?.quizzes || []).map(q => new Date(q.completedAt).toDateString()),
                ];
                const wasActive = allDays.includes(dayStr);
                const isToday = dayStr === new Date().toDateString();
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                      wasActive
                        ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md shadow-orange-200'
                        : isToday
                        ? 'bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-300 dark:border-orange-500/40 text-orange-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                    }`}>
                      {wasActive ? '✓' : isToday ? '·' : ''}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {day.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-3">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* AI Suggestions */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">AI Suggestions</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Smart actions to help you study more effectively</p>
            </div>
          </div>

          <div className="space-y-4">
            {aiSuggestions.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/50 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
                  Try now
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Jump into your next task</p>
            </div>
          </div>

          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{action.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your latest learning interactions</p>
          </div>
        </div>

        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 hover:bg-orange-50/50 dark:hover:bg-orange-500/5 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    activity.type === 'document'
                      ? 'bg-blue-100 dark:bg-blue-500/10'
                      : 'bg-orange-100 dark:bg-orange-500/10'
                  }`}>
                    {activity.type === 'document' ? (
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <BrainCircuit className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {activity.type === 'document' ? 'Accessed Document' : 'Attempted Quiz'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{activity.description}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Invalid Date'}
                    </p>
                  </div>
                </div>
                {activity.link && (
                  <Link
                    to={activity.link}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    View
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-14">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-700 mb-4">
              <Clock className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold">No recent activity yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              Start uploading documents, creating flashcards, or taking quizzes to see activity here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;