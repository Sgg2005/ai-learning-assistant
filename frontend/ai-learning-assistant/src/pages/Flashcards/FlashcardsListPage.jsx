import React, { useState, useEffect } from 'react';
import flashcardService from '../../services/flashcardServices';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import FlashcardSetCard from '../../components/flashcards/flashcardSetCard';
import toast from 'react-hot-toast';

const FlashcardsListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();

        // normalize possible API shapes
        const sets = response?.data?.data || response?.data || [];
        setFlashcardSets(Array.isArray(sets) ? sets : []);
      } catch (error) {
        toast.error('Failed to fetch flashcard sets');
        console.error('Failed to fetch flashcard sets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSets();
  }, []);

  const renderContent = () => {
    if (loading) return <Spinner />;

    if (!flashcardSets.length) {
      return (
        <EmptyState
          title="No Flashcard Sets"
          description="You haven't created any flashcard sets yet."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {flashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="All Flashcard Sets" />
      {renderContent()}
    </div>
  );
};

export default FlashcardsListPage;