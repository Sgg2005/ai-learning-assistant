import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';
import quizService from '../../services/quizServices';
import aiService from '../../services/aiService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';


const QuizTakePage = () => {

  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [retaking, setRetaking] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);
        setQuiz(response.data);
      } catch (error) {
        toast.error('Failed to load quiz');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleOptionChange = (questionId, optionId) => {
    setSelectedAnswer(prev => ({ 
      ...prev, 
      [questionId]: optionId 
    }));
  };

  const handleNextQuestion = () => {
    if(currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = Object.keys(selectedAnswer).map(questionId => {
        const question = quiz.questions.find(q => q._id === questionId);
        const questionIndex = quiz.questions.findIndex(q => q._id === questionId);
        const optionIndex = selectedAnswer[questionId];
        const userAnswerText = question.options[optionIndex];
        return { questionIndex, selectedAnswer: userAnswerText };
      });

      await quizService.submitQuiz(quizId, formattedAnswers);
      toast.success('Quiz submitted successfully');
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      toast.error('Failed to submit quiz');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = async () => {
    setRetaking(true);
    try {
        const response = await aiService.generateQuiz(quiz.documentId, {
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

  if(loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }
  
  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Quiz not found or it has no questions.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = selectedAnswer.hasOwnProperty(currentQuestion._id);
  const answeredCount = Object.keys(selectedAnswer).length;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title={quiz.title || 'Take Quiz'} />

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm font-medium text-slate-500">
            {answeredCount} answered
          </span>
        </div>
        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(answeredCount / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center" />
          <span className="text-sm font-semibold text-orange-500">
            Question {currentQuestionIndex + 1}
          </span>
        </div>
      
        <h3 className="text-lg font-semibold text-slate-800 mb-6">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer[currentQuestion._id] === index; 
            return (
              <label
                key={index}
                className={`group relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/10'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion._id}`}
                  value={index}
                  checked={isSelected}
                  onChange={() => handleOptionChange(currentQuestion._id, index)}
                  className="sr-only"
                />
                
                <div className={`shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  isSelected 
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-slate-300 bg-white group-hover:border-orange-300'
                }`}>
                  {isSelected && (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="w-2 h-2 rounded-full bg-white" /> 
                    </div>
                  )}
                </div>

                <span className={`ml-4 text-sm font-medium transition-colors duration-200 ${
                  isSelected 
                    ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                }`}>
                  {option}
                </span>
                
                {isSelected && (
                  <CheckCircle2
                     className="ml-auto w-5 h-5 text-orange-500"
                     strokeWidth={2.5}
                  />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8">
        <Button
           onClick={handlePreviousQuestion}
           disabled={currentQuestionIndex === 0 || submitting}
           variant='secondary'
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {currentQuestionIndex === quiz.questions.length - 1 && (
            <button
              onClick={handleRetake}
              disabled={retaking || submitting}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 text-sm font-medium hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {retaking ? (
                <>
                  <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                  New Questions
                </>
              )}
            </button>
          )}

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
               onClick={handleSubmitQuiz}
               disabled={submitting || retaking}
               className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                  Submit Quiz
                </>
              )}
            </button>
          ) : (
            <Button
                onClick={handleNextQuestion}
                disabled={submitting}
            >
              Next
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigation Dots */}
      <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
        {quiz.questions.length >= 5 && quiz.questions.map((question, index) => {
          const isAnsweredQuestion = selectedAnswer.hasOwnProperty(question._id);
          const isCurrent = currentQuestionIndex === index;

          return (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              disabled={submitting}
              className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all duration-200 ${
                isCurrent
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 scale-110'
                  : isAnsweredQuestion
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizTakePage;