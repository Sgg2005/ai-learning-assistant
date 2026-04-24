import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../services/flashcardServices";
import aiService from "../../services/aiService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Flashcard from "../../components/flashcards/Flashcard";

const FlashCardPage = () => {
  const { id: documentId } = useParams();
  const [flashcardsSets, setFlashcardsSets] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcards(response.data[0]);
      setFlashcardsSets(response.data[0]?.cards || []);
    } catch (error) {
      toast.error("Failed to fetch flashcards");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
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
    handleReview(currentCardIndex + 1);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcardsSets.length);
  };

  const handlePrevCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex(
      (prevIndex) => (prevIndex - 1 + flashcardsSets.length) % flashcardsSets.length
    );
  };

  const handleReview = async (index) => {
    const currentCard = flashcardsSets[currentCardIndex];
    if (!currentCard) return;
    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
    } catch (error) {
      toast.error("Failed to review flashcard");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcardsSets((prev) =>
        prev.map((card) =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
        )
      );
      toast.success("Flashcard starred status updated");
    } catch (error) {
      toast.error("Failed to update starred status");
    }
  };

  const handleDeleteFlashcard = async () => {
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(flashcards._id);
      toast.success("Flashcard set deleted successfully");
      setIsDeleteModalOpen(false);
      fetchFlashcards();
    } catch (error) {
      toast.error(error.message || "Failed to delete flashcard set");
    } finally {
      setDeleting(false);
    }
  };

  const renderFlashcardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      );
    }

    if (!flashcardsSets || flashcardsSets.length === 0) {
      return (
        <EmptyState
          title="No flashcards found"
          description="Generate flashcards from your document to start reviewing."
        />
      );
    }

    const currentCard = flashcardsSets[currentCardIndex];

    return (
      <div className="flex flex-col items-center gap-8">
        <div className="w-full">
          <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
        </div>
        <div className="flex items-center gap-6">
          <Button onClick={handlePrevCard} variant="secondary" disabled={flashcardsSets.length <= 1}>
            <ChevronLeft size={16} /> Previous
          </Button>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {currentCardIndex + 1} / {flashcardsSets.length}
          </span>
          <Button onClick={handleNextCard} variant="secondary" disabled={flashcardsSets.length <= 1}>
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/documents/${documentId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Document
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Flashcards" />
        <div className="flex items-center gap-3">
          {!loading && (
            flashcardsSets.length > 0 ? (
              <Button onClick={() => setIsDeleteModalOpen(true)} disabled={deleting} variant="secondary">
                <Trash2 size={16} /> Delete Set
              </Button>
            ) : (
              <button
                onClick={handleGenerateFlashcards}
                disabled={generating}
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-medium shadow-md shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                {generating ? <Spinner /> : <><Plus size={16} /> Generate Flashcards</>}
              </button>
            )
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8 transition-colors duration-300">
        {renderFlashcardContent()}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Flashcard Set"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Are you sure you want to delete this flashcard set? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={handleDeleteFlashcard} disabled={deleting} variant="danger">
              {deleting ? <Spinner /> : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FlashCardPage;