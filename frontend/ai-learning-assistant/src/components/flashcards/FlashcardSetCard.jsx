import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import moment from 'moment';

const FlashcardSetCard = ({ flashcardSet }) => {
  const navigate = useNavigate();

  const cards = Array.isArray(flashcardSet?.cards) ? flashcardSet.cards : [];
  const reviewedCount = cards.filter((card) => (card?.reviewCount || 0) > 0).length;
  const totalCount = cards.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0;

  const handleStudyNow = () => {
    const documentId = flashcardSet?.documentId?._id || flashcardSet?.documentId;
    navigate(`/documents/${documentId}/flashcards`);
  };

  return (
    <div
      className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-6 cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-200"
      onClick={handleStudyNow}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-orange-500" strokeWidth={2.5} />
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <h3
              className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate"
              title={flashcardSet?.documentId?.title || 'Untitled Document'}
            >
              {flashcardSet?.documentId?.title || 'Untitled Document'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Created {flashcardSet?.createdAt ? moment(flashcardSet.createdAt).fromNow() : 'recently'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl px-3 py-1.5">
            <span className="text-xs font-semibold text-orange-500">
              {totalCount} {totalCount === 1 ? 'Card' : 'Cards'}
            </span>
          </div>

          {reviewedCount > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl px-3 py-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
              <span className="text-xs font-semibold text-emerald-500">
                {progressPercentage}% Reviewed
              </span>
            </div>
          )}
        </div>

        {totalCount > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Progress</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {reviewedCount} / {totalCount} reviewed
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5">
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          onClick={(e) => {
            e.stopPropagation();
            handleStudyNow();
          }}
        >
          <Sparkles className="w-4 h-4" strokeWidth={2.5} />
          Study Now
        </button>
      </div>
    </div>
  );
};

export default FlashcardSetCard;