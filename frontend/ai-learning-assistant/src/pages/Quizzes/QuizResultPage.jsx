import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizServices';
import aiService from '../../services/aiService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Target, BookOpen, RotateCcw } from 'lucide-react';

const QuizResultPage = () => {

  const { quizId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retaking, setRetaking] = useState(false);

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
        <div className="text-center">
          <p className="text-slate-600 text-lg">No results found for this quiz.</p>
        </div>
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button and Header */}
      <div className="mb-6">
        <Link
          to={`/documents/${quiz.document._id}`}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="inline-block mr-2 w-4 h-4" />
          Back to Document
        </Link>
      </div>

      <PageHeader title={`${quiz.title || 'Quiz'} Results`} />

      {/* Score and Summary */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-orange-500" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Your Score</p>
              <div className={`inline-block text-5xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent mb-2`}>
                {score}%
              </div>
              <p className="text-sm text-slate-600">{getScoreMessage(score)}</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
              <Target className="w-5 h-5 text-orange-500" strokeWidth={2} />
              <span className="text-sm font-semibold text-orange-500">{totalQuestions} Total</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2} />
              <span className="text-sm font-semibold text-emerald-500">{correctAnswers} Correct</span>
            </div>
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <XCircle className="w-5 h-5 text-red-500" strokeWidth={2} />
              <span className="text-sm font-semibold text-red-500">{incorrectAnswers} Incorrect</span>
            </div>
          </div>
      </div>

      {/* Questions Review */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-orange-500" strokeWidth={2} />
          <h3 className="text-lg font-semibold text-slate-800">Detailed Review</h3>
        </div>

        {detailedResults.map((result, index) => {
          const userAnswerIndex = result.options.findIndex(opt => opt === result.selectedAnswer);
          const correctAnswerIndex = result.options.findIndex(opt => opt === result.correctAnswer);
          const isCorrect = result.isCorrect;

          return (
            <div
              key={index}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
                    Question {index + 1}:
                  </span>
                  <h4 className="text-sm font-semibold text-slate-800">{result.question}</h4>
                </div>
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  isCorrect
                    ? 'bg-emerald-50 border-2 border-emerald-200'
                    : 'bg-red-50 border-2 border-red-200'
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
                          ? 'bg-emerald-50 border-emerald-300 shadow-lg shadow-emerald-200/50'
                          : isWrongAnswer
                          ? 'bg-red-50 border-red-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          isCorrectOption
                            ? 'text-emerald-600'
                            : isWrongAnswer
                            ? 'text-red-500'
                            : 'text-slate-600'
                        }`}>
                          {option}
                        </span>
                        <div className="flex items-center gap-1">
                          {isCorrectOption && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                              Correct Answer
                            </span>
                          )}
                          {isWrongAnswer && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
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
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-orange-500" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Explanation</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{result.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center gap-3">
        <Link to={`/documents/${quiz.document._id}`}>
          <button className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 text-sm font-semibold hover:bg-orange-100 transition-all">
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
      </div>
    </div>
  );
};

export default QuizResultPage;