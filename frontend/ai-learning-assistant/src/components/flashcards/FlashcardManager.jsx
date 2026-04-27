import React, { useState, useEffect } from "react";
import {
  Plus, ChevronLeft, ChevronRight, Trash2, ArrowLeft,
  Sparkles, Brain, Pencil, Check, X,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardServices";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import Flashcard from "./Flashcard";

const FlashcardManager = ({ documentId }) => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null);
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');

    const fetchFlashcards = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardsForDocument(documentId);
            setFlashcardSets(response.data);
        } catch (error) {
            toast.error("Failed to load flashcards");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) fetchFlashcards();
    }, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try {
            await aiService.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully");
            fetchFlashcards();
        } catch (error) {
            toast.error(error.message || "Failed to generate flashcards");
        } finally {
            setGenerating(false);
        }
    };

    const handleNextCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex((prevIndex) => (prevIndex + 1) % selectedSet.cards.length);
        }
    };

    const handlePrevCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex((prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length);
        }
    };

    const handleReview = async (cardIndex) => {
        const currentCard = selectedSet?.cards[cardIndex];
        if (!currentCard) return;
        try {
            await flashcardService.reviewFlashcard(currentCard._id, cardIndex);
        } catch (error) {
            toast.error("Failed to review flashcard");
        }
    };

    const handleToggleStar = async (cardId) => {
        try {
            await flashcardService.toggleStar(cardId);
            const updatedSets = flashcardSets.map((set) => {
                if (set._id === selectedSet._id) {
                    const updatedCards = set.cards.map((card) =>
                        card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
                    );
                    return { ...set, cards: updatedCards };
                }
                return set;
            });
            setFlashcardSets(updatedSets);
            setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id));
            toast.success("Flashcard starred status updated!");
        } catch (error) {
            toast.error("Failed to update flashcard status");
        }
    };

    const handleDeleteRequest = (e, set) => {
        e.stopPropagation();
        setSetToDelete(set);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!setToDelete) return;
        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(setToDelete._id);
            toast.success("Flashcard set deleted successfully");
            setIsDeleteModalOpen(false);
            setSetToDelete(null);
            fetchFlashcards();
        } catch (error) {
            toast.error(error.message || "Failed to delete flashcard set.");
        } finally {
            setDeleting(false);
        }
    };

    const handleRenameRequest = (e, set) => {
        e.stopPropagation();
        setRenamingId(set._id);
        setRenameValue(set.title || 'Flashcard Set');
    };

    const handleConfirmRename = async (e, setId) => {
        e.stopPropagation();
        if (!renameValue.trim()) return;
        try {
            await flashcardService.renameFlashcardSet(setId, renameValue.trim());
            setFlashcardSets(prev => prev.map(s =>
                s._id === setId ? { ...s, title: renameValue.trim() } : s
            ));
            toast.success("Flashcard set renamed successfully");
            setRenamingId(null);
        } catch (error) {
            toast.error("Failed to rename flashcard set");
        }
    };

    const handleSelectSet = (set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
    };

    const renderFlashcardSets = () => {
        const currentCard = selectedSet.cards[currentCardIndex];
        return (
            <div className="space-y-8">
                <button
                    onClick={() => setSelectedSet(null)}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={2} />
                    Back to Sets
                </button>

                <div className="flex flex-col items-center justify-center space-y-8">
                    <div className="w-full max-w-2xl mb-4">
                        <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-6 w-full">
                        <button
                            onClick={handlePrevCard}
                            disabled={selectedSet.cards.length <= 1}
                            className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-orange-50 dark:bg-slate-700 border border-orange-100 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-orange-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                            Previous
                        </button>

                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {currentCardIndex + 1}
                            <span className="text-slate-400 mx-1">of</span>
                            {selectedSet.cards.length}
                        </span>

                        <button
                            onClick={handleNextCard}
                            disabled={selectedSet.cards.length <= 1}
                            className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-md shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSetList = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-16">
                    <Spinner />
                </div>
            );
        }

        if (flashcardSets.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center text-center min-h-[400px] px-6">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                        <Brain className="w-8 h-8 text-orange-400" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No Flashcards Yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                        Generate flashcards from your document to start reviewing key concepts and information.
                    </p>
                    <button
                        className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-md shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                    >
                        {generating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" strokeWidth={2} />
                                Generate Flashcards
                            </>
                        )}
                    </button>
                </div>
            );
        }

        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Your Flashcard Sets</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {flashcardSets.length} {flashcardSets.length === 1 ? "set" : "sets"} available
                        </p>
                    </div>
                    <button
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                        className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-md shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {generating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" strokeWidth={2.5} />
                                Generate New Set
                            </>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {flashcardSets.map((set) => (
                        <div
                            key={set._id}
                            onClick={() => renamingId === set._id ? null : handleSelectSet(set)}
                            className="relative bg-white dark:bg-slate-700 border border-orange-100 dark:border-slate-600 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-500/40 cursor-pointer transition-all flex flex-col gap-3"
                        >
                            <div className="absolute top-3 right-3 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={(e) => handleRenameRequest(e, set)}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
                                >
                                    <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteRequest(e, set)}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                            </div>

                            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                                <Brain className="w-6 h-6 text-orange-400" strokeWidth={2} />
                            </div>

                            <div>
                                {renamingId === set._id ? (
                                    <div className="flex items-center gap-2 mt-1" onClick={e => e.stopPropagation()}>
                                        <input
                                            autoFocus
                                            value={renameValue}
                                            onChange={e => setRenameValue(e.target.value)}
                                            className="flex-1 text-sm bg-white dark:bg-slate-600 border border-orange-200 dark:border-slate-500 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-orange-300 dark:text-slate-200"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleConfirmRename(e, set._id);
                                                if (e.key === 'Escape') setRenamingId(null);
                                            }}
                                        />
                                        <button onClick={(e) => handleConfirmRename(e, set._id)} className="text-orange-500 hover:text-orange-700">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setRenamingId(null); }} className="text-slate-400 hover:text-slate-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                        {set.title || 'Flashcard Set'}
                                    </h4>
                                )}
                                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">
                                    Created {moment(set.createdAt).format("MMM D, YYYY")}
                                </p>
                            </div>

                            <div className="mt-auto pt-3 border-t border-orange-50 dark:border-slate-600">
                                <span className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-500 text-xs font-medium px-3 py-1 rounded-lg">
                                    {set.cards.length} {set.cards.length === 1 ? "card" : "cards"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8 transition-colors duration-300">
                {selectedSet ? renderFlashcardSets() : renderSetList()}
            </div>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Flashcard Set">
                <div className="flex flex-col gap-5">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Are you sure you want to delete this flashcard set? This action cannot be undone.
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleting}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-orange-50 dark:bg-slate-700 border border-orange-100 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-orange-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {deleting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Deleting...
                                </span>
                            ) : "Delete Set"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default FlashcardManager;