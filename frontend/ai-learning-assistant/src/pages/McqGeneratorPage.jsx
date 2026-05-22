import React, { useEffect, useState } from "react";
import { FileText, Sparkles, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import aiService from "../services/aiService";

const McqGeneratorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const documentId = location.state?.documentId;
  const questionCount = location.state?.questionCount || 10;
  const fileName = location.state?.fileName || "Uploaded document";

  useEffect(() => {
    if (!documentId) {
      toast.error("No document found. Please upload a document first.");
      navigate("/exam-generator");
    }
  }, [documentId, navigate]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);

      const result = await aiService.generateMcqQuestions({
        documentId,
        questionCount: Number(questionCount),
      });

      const questions = result?.questions || result?.data?.questions || result?.data || [];

      if (!questions || !questions.length) {
        throw new Error("No questions were returned from the backend.");
      }

      setQuiz(questions);
      setSelectedAnswers({});
      setSubmitted(false);
      toast.success("MCQs generated successfully.");
    } catch (error) {
      toast.error(error?.message || error?.error || "Failed to generate MCQs.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectAnswer = (questionIndex, option) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const score = quiz.reduce((total, question, index) => {
    const selected = selectedAnswers[index];
    if (selected && selected === question.correctAnswer) return total + 1;
    return total;
  }, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          MCQ Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          Generate MCQs from the uploaded document:{" "}
          <span className="font-semibold">{fileName}</span>
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Questions: {questionCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will generate MCQs automatically from the uploaded content.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-semibold shadow-sm shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          {generating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} strokeWidth={2.5} />
              Generate MCQs
            </>
          )}
        </button>
      </div>

      {quiz.length > 0 && (
        <div className="mt-6 space-y-6">
          {quiz.map((question, index) => {
            const selected = selectedAnswers[index];
            const isCorrect = submitted && selected === question.correctAnswer;

            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {index + 1}. {question.question}
                  </h3>
                  {submitted && (
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Wrong"}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid gap-3">
                  {question.options?.map((option, optionIndex) => {
                    const isSelected = selected === option;
                    const isRightAnswer = submitted && option === question.correctAnswer;

                    return (
                      <button
                        key={optionIndex}
                        type="button"
                        onClick={() => handleSelectAnswer(index, option)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                          isSelected
                            ? "border-orange-400 bg-orange-50 dark:bg-orange-500/10"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                        } ${
                          submitted && isRightAnswer
                            ? "border-green-500 bg-green-50 dark:bg-green-500/10"
                            : ""
                        } ${
                          submitted && isSelected && !isRightAnswer
                            ? "border-red-500 bg-red-50 dark:bg-red-500/10"
                            : ""
                        }`}
                        disabled={submitted}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {submitted && question.explanation && (
                  <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">Explanation:</span>{" "}
                    {question.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              Submit Quiz
            </button>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Score: {score} / {quiz.length}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default McqGeneratorPage;