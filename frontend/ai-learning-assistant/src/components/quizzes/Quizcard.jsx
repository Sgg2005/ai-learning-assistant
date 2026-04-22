import React, { useState } from 'react'
import {Link} from 'react-router-dom'
import {Play, BarChart2, Trash2, Award, Pencil, RotateCcw} from 'lucide-react'
import moment from 'moment'
import quizService from '../../services/quizServices'
import aiService from '../../services/aiService'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Quizcard = ({quiz, onDelete, onRename, onRefresh}) => {
  const navigate = useNavigate();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(quiz.title || '');
  const [saving, setSaving] = useState(false);
  const [retaking, setRetaking] = useState(false);

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle === quiz.title) {
      setIsRenaming(false);
      return;
    }
    setSaving(true);
    try {
      await quizService.renameQuiz(quiz._id, newTitle.trim());
      toast.success('Quiz renamed successfully');
      setIsRenaming(false);
      if (onRename) onRename();
    } catch (error) {
      toast.error('Failed to rename quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = async (e) => {
    e.stopPropagation();
    setRetaking(true);
    try {
        const response = await aiService.generateQuiz(quiz.documentId, {
            questionCount: quiz.totalQuestions
        });
        toast.success('New quiz generated!');
        if (onRefresh) onRefresh();
        navigate(`/quizzes/take/${response.data._id}`);
    } catch (error) {
        toast.error('Failed to generate new quiz');
    } finally {
        setRetaking(false);
    }
  };

  return (
    <>
    <div className="relative bg-white border border-orange-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex flex-col gap-4">
        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
            <button
               onClick={(e) => {
                e.stopPropagation();
                setNewTitle(quiz.title || '');
                setIsRenaming(true);
               }}
               className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
            >
                <Pencil className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
               onClick={(e) => {
                e.stopPropagation();
                onDelete(quiz);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
        </div>

        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-3 py-1 rounded-lg">
                    <Award className="w-3.5 h-3.5 text-orange-500" strokeWidth={2.5} />
                    <span className="text-xs font-medium text-orange-500">Score: {quiz?.score}</span>
                </div>
            </div>

            <h3 className="text-base font-semibold text-slate-800 truncate pr-20" title={quiz.title}>
                {quiz.title || `Quiz - ${moment(quiz.createdAt).format('MMM D, YYYY')}`}
            </h3>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
                Created {moment(quiz.createdAt).format('MMM D, YYYY')}
            </p>
        </div>

        <div className="flex items-center gap-2">
            <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-1">
                <span className="text-xs font-medium text-orange-500">
                  {quiz.questions.length}{" "}
                  {quiz.questions.length === 1 ? "Question" : "Questions"}
                </span>
            </div>
        </div>

        <div className="mt-auto pt-3 border-t border-orange-50 flex flex-col gap-2">
            {quiz?.userAnswers?.length > 0 ? (
                <>
                    <Link to={`/quizzes/${quiz._id}/results`}>
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 text-sm font-medium hover:bg-orange-100 transition-all">
                            <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
                            View Results
                        </button>
                    </Link>
                    <button
                        onClick={handleRetake}
                        disabled={retaking}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-md shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                </>
            ) : (
                <Link to={`/quizzes/take/${quiz._id}`}>
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-md shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Play className="w-4 h-4" strokeWidth={2.5} />
                        Begin Quiz
                    </button>
                </Link>
            )}
        </div>
    </div>

    {/* Rename Modal */}
    {isRenaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-5">
                <h3 className="text-base font-semibold text-slate-800">Rename Quiz</h3>
                <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-100 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                    placeholder="Enter new quiz name..."
                />
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsRenaming(false)}
                        disabled={saving}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-orange-50 border border-orange-100 text-slate-600 text-sm font-medium hover:bg-orange-100 disabled:opacity-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRename}
                        disabled={saving || !newTitle.trim()}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-md shadow-orange-200 hover:scale-[1.02] disabled:opacity-50 transition-all"
                    >
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  )
}

export default Quizcard