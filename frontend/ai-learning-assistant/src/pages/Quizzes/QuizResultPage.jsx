import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizServices';
import aiService from '../../services/aiService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Target, BookOpen, RotateCcw, BarChart2, Download } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const QuizResultPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retaking, setRetaking] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
        setResults(data);
      } catch (error) {
        toast.error('Failed to load quiz results');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [quizId]);

  useEffect(() => {
    if (!results?.data?.quiz?.document?._id) return;
    const fetchHistory = async () => {
      try {
        const data = await quizService.getQuizzesForDocument(results.data.quiz.document._id);
        const completed = (data.data || [])
          .filter(q => q.isCompleted)
          .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
          .map((q, i) => ({
            name: `Quiz ${i + 1}`,
            score: q.score,
            current: q._id === quizId
          }));
        setQuizHistory(completed);
      } catch (error) {
        console.error(error);
      }
    };
    fetchHistory();
  }, [results]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!results || !results.data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-600 dark:text-slate-400 text-lg">No results found for this quiz.</p>
      </div>
    );
  }

  const { data: { quiz, results: detailedResults } } = results;
  const score = quiz.score;
  const totalQuestions = detailedResults.length;
  const correctAnswers = detailedResults.filter(r => r.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const handleRetake = async () => {
    setRetaking(true);
    try {
      const response = await aiService.generateQuiz(quiz.document._id, {
        questionCount: quiz.totalQuestions
      });
      toast.success('New quiz generated!');
      navigate(`/quizzes/take/${response.data._id}`);
    } catch (error) {
      toast.error('Failed to generate new quiz');
    } finally {
      setRetaking(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const getScoreColor = () => {
    if (score >= 80) return 'from-orange-500 to-orange-700';
    if (score >= 50) return 'from-orange-500 to-orange-700';
    return 'from-orange-500 to-orange-500';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent work! You have a strong understanding of the material.';
    if (score >= 80) return 'Good job! You have a decent understanding, but there is room for improvement.';
    if (score >= 70) return 'Good effort! Keep practicing to improve your understanding.';
    if (score >= 60) return 'Not bad! You have a basic understanding, but there is room for improvement.';
    return 'Keep Practicing! You may want to review the material and try again.';
  };

  const radialData = [{ value: score }];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 shadow-lg">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{payload[0].payload.name}</p>
          <p className="text-sm text-orange-500 font-bold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/documents/${quiz.document._id}`}
          className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="inline-block mr-2 w-4 h-4" />
          Back to Document
        </Link>
      </div>

      <PageHeader title={`${quiz.title || 'Quiz'} Results`} />

      <div ref={printRef} id="print-area">
        {/* Score and Summary */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8 mb-6 transition-colors duration-300">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-orange-500" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Your Score</p>
              <div className={`inline-block text-5xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent mb-2`}>
                {score}%
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{getScoreMessage(score)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl px-4 py-3">
              <Target className="w-5 h-5 text-orange-500" strokeWidth={2} />
              <span className="text-sm font-semibold text-orange-500">{totalQuestions} Total</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2} />
              <span className="text-sm font-semibold text-emerald-500">{correctAnswers} Correct</span>
            </div>
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-3">
              <XCircle className="w-5 h-5 text-red-500" strokeWidth={2} />
              <span className="text-sm font-semibold text-red-500">{incorrectAnswers} Incorrect</span>
            </div>
          </div>
        </div>

        {/* Score History Chart */}
        {quizHistory.length > 1 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8 mb-6 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-6">
              <BarChart2 className="w-5 h-5 text-orange-500" strokeWidth={2} />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Score History</h3>
            </div>
            <div className="flex items-center gap-8">
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={radialData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        fill="#f97316"
                        background={{ fill: '#fff7ed' }}
                        angleAxisId={0}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Current Score</p>
                <p className="text-2xl font-bold text-orange-500">{score}%</p>
              </div>

              <div className="flex-1 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quizHistory} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#fdba74" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Questions Review */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8 space-y-6 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-orange-500" strokeWidth={2} />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Detailed Review</h3>
          </div>

          {detailedResults.map((result, index) => {
            const userAnswerIndex = result.options.findIndex(opt => opt === result.selectedAnswer);
            const correctAnswerIndex = result.options.findIndex(opt => opt === result.correctAnswer);
            const isCorrect = result.isCorrect;

            return (
              <div key={index} className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
                      Question {index + 1}:
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{result.question}</h4>
                  </div>
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" strokeWidth={2.5} />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {result.options.map((option, optIndex) => {
                    const isCorrectOption = optIndex === correctAnswerIndex;
                    const isUserAnswer = optIndex === userAnswerIndex;
                    const isWrongAnswer = isUserAnswer && !isCorrectOption;

                    return (
                      <div
                        key={optIndex}
                        className={`relative px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          isCorrectOption
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40 shadow-lg shadow-emerald-200/50'
                            : isWrongAnswer
                            ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
                            : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${
                            isCorrectOption
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isWrongAnswer
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}>
                            {option}
                          </span>
                          <div className="flex items-center gap-1">
                            {isCorrectOption && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                                Correct Answer
                              </span>
                            )}
                            {isWrongAnswer && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400">
                                <XCircle className="w-4 h-4" strokeWidth={2.5} />
                                Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {result.explanation && (
                  <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-orange-500" strokeWidth={2} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Explanation</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{result.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center gap-3">
        <Link to={`/documents/${quiz.document._id}`}>
          <button className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-500 text-sm font-semibold hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all">
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Return to Document
          </button>
        </Link>
        <button
          onClick={handleRetake}
          disabled={retaking}
          className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {retaking ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
              Retake with New Questions
            </>
          )}
        </button>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-sm font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" strokeWidth={2.5} />
              Export PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizResultPage;