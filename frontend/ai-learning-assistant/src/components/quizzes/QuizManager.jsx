import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import quizService from '../../services/quizServices';
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import Quizcard from './Quizcard';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';

const QuizManager = ({ documentId }) => {

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const data = await quizService.getQuizzesForDocument(documentId);
            setQuizzes(data.data || data || []);
        } catch (error) {
            toast.error('Failed to load quizzes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchQuizzes();
        }
    }, [documentId]);

    const handleGenerateQuiz = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            await aiService.generateQuiz(documentId, { questionCount: numQuestions });
            toast.success('Quiz generated successfully');
            setIsGenerateModalOpen(false);
            await fetchQuizzes();
        } catch (error) {
            toast.error(error.message || 'Failed to generate quiz');
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteRequest = (quiz) => {
        setSelectedQuiz(quiz);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedQuiz) return;
        setDeleting(true);
        try {
            await quizService.deleteQuiz(selectedQuiz._id);
            toast.success('Quiz deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedQuiz(null);
            await fetchQuizzes();
        } catch (error) {
            toast.error(error.message || 'Failed to delete quiz');
        } finally {
            setDeleting(false);
        }
    };

    const renderQuizContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-16">
                    <Spinner />
                </div>
            );
        }

        if (quizzes.length === 0) {
            return (
                <EmptyState
                    title="No Quizzes Yet"
                    description="Generate a quiz from your document to test your knowledge!"
                />
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quizzes.map((quiz) => (
                    <Quizcard key={quiz._id} quiz={quiz} onDelete={() => handleDeleteRequest(quiz)} onRename={fetchQuizzes} />
                ))}
            </div>
        );
    };

    return (
        <>
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Your Quizzes</h3>
                    <p className="text-sm text-slate-500">
                        {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'} available
                    </p>
                </div>
                <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-md shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    Generate Quiz
                </button>
            </div>

            {renderQuizContent()}
        </div>

        {/* Generate Quiz Modal */}
        <Modal
            isOpen={isGenerateModalOpen}
            onClose={() => setIsGenerateModalOpen(false)}
            title="Generate New Quiz"
        >
            <form onSubmit={handleGenerateQuiz} className="flex flex-col gap-5">
                <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Number of Questions
                    </label>
                    <input
                        type="number"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-100 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsGenerateModalOpen(false)}
                        disabled={generating}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-orange-50 border border-orange-100 text-slate-600 text-sm font-medium hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={generating}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-md shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {generating ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Generating...
                            </span>
                        ) : (
                            'Generate'
                        )}
                    </button>
                </div>
            </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Confirm Delete Quiz"
        >
            <div className="flex flex-col gap-5">
                <p className="text-sm text-slate-600 leading-relaxed">
                    Are you sure you want to delete the quiz: <span className="font-semibold text-slate-800">{selectedQuiz?.title || 'this quiz'}</span>
                </p>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDeleteModalOpen(false)}  
                        disabled={deleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        disabled={deleting}
                        variant="danger"
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>
        </Modal>
        </>
    );
};

export default QuizManager;