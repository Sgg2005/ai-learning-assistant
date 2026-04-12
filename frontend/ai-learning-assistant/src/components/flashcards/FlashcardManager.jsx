import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Sparkles,
  Brain,
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

    const fetchFlashcards = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardsForDocument(documentId);
            setFlashcardSets(response.data);
        } catch (error) {
            toast.error("Failed to load flashcards");
            console.error("Error fetching flashcards:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchFlashcards();
        }
    }, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try {
            const response = await aiService.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully");
            fetchFlashcards();
        } catch (error) {
            toast.error(error.message || "Failed to generate flashcards");  
        } finally {
            setGenerating(false);
        }
    };

    const handleNextCard = () => {
        if (selectedSet){
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) => (prevIndex + 1) % selectedSet.cards.length
            );
        }
    };

    const handlePrevCard = () => {
        if (selectedSet){
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) =>
                (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length
            );
        }
    };

    const handleReview = async (cardIndex) => {
        const currentCard = selectedSet?.cards[cardIndex];
        if (!currentCard) return;

        try {
            await flashcardService.reviewFlashcard(currentCard._id, cardIndex);
            toast.success("Flashcard reviewed!");
        } catch (error) {
            toast.error("Failed to review flashcard");
        }
    };

    const handleToggleStar = async (cardIndex) => {};

    const handleDeleteRequest = (e, set) => {
        e.stopPropagation();
        setSetToDelete(set);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if(!setToDelete) return;
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

    const handleSelectSet = (set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
    };

    const renderFlashcardSets = () => {
        return "renderFlashcardViewer";
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
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                        <Brain className="w-8 h-8 text-orange-400" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        No Flashcards Yet
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-6">
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
                {/* Header with Generate Button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                            Your Flashcard Sets
                        </h3>
                        <p className="text-sm text-slate-500">
                            {flashcardSets.length}{" "}
                            {flashcardSets.length === 1 ? "set" : "sets"} available
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

                {/* Flashcard Set List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {flashcardSets.map((set) => (
                        <div
                            key={set._id}
                            onClick={() => handleSelectSet(set)}
                            className="relative bg-white border border-orange-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 cursor-pointer transition-all flex flex-col gap-3"
                        >
                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDeleteRequest(e, set)}
                                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                                <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                            </button>

                            {/* Icon */}
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                <Brain className="w-6 h-6 text-orange-400" strokeWidth={2} />
                            </div>

                            {/* Title & Date */}
                            <div>
                                <h4 className="text-base font-semibold text-slate-800">
                                    Flashcard Set
                                </h4>
                                <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">
                                    Created {moment(set.createdAt).format("MMM D, YYYY")}
                                </p>
                            </div>

                            {/* Card Count Badge */}
                            <div className="mt-auto pt-3 border-t border-orange-50">
                                <span className="bg-orange-50 border border-orange-100 text-orange-500 text-xs font-medium px-3 py-1 rounded-lg">
                                    {set.cards.length}{" "}
                                    {set.cards.length === 1 ? "card" : "cards"}
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
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
            {selectedSet ? renderFlashcardSets() : renderSetList()}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
           isOpen={isDeleteModalOpen}
           onClose={() => setIsDeleteModalOpen(false)}
           title="Delete Flashcard Set"
        >
         <div className="flex flex-col gap-5">
            <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete this flashcard set? This action cannot be undone.
            </p>
         <div className="flex items-center gap-3">
            <button 
               type="button"
               onClick={() => setIsDeleteModalOpen(false)}
               disabled={deleting}
               className="flex-1 py-2.5 px-4 rounded-xl bg-orange-50 border border-orange-100 text-slate-600 text-sm font-medium hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                ) : (
                    "Delete Set"
                )}
                </button>
            </div>
        </div>
    </Modal>
        </>
    );
};

export default FlashcardManager;