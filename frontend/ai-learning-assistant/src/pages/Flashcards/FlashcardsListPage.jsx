import React, { useState, useEffect } from 'react';
import flashcardService from '../../services/flashcardServices';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import FlashcardSetCard from '../../components/flashcards/flashcardSetCard';
import toast from 'react-hot-toast';
import { Star, Search, X } from 'lucide-react';

const FlashcardsListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();
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

  const filteredSets = flashcardSets
    .filter(set => showStarredOnly ? set.cards?.some(card => card.isStarred) : true)
    .filter(set => searchQuery
      ? set.documentId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    );

  const starredCount = flashcardSets.filter(set =>
    set.cards?.some(card => card.isStarred)
  ).length;

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

    if (filteredSets.length === 0) {
      return (
        <EmptyState
          title={showStarredOnly ? "No Starred Flashcard Sets" : "No Results Found"}
          description={showStarredOnly
            ? "You haven't starred any flashcards yet."
            : `No flashcard sets match "${searchQuery}".`
          }
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="All Flashcard Sets" />
        <button
          onClick={() => setShowStarredOnly(!showStarredOnly)}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
            showStarredOnly
              ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
              : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-500'
          }`}
        >
          <Star className="w-4 h-4" strokeWidth={2.5} fill={showStarredOnly ? 'white' : 'none'} />
          Starred {starredCount > 0 && `(${starredCount})`}
        </button>
      </div>

      {/* Search Bar */}
      {!loading && flashcardSets.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flashcard sets..."
            className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default FlashcardsListPage;