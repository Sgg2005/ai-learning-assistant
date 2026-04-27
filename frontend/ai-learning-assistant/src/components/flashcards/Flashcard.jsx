import { useState } from "react";
import { Star, RotateCcw } from "lucide-react";

const Flashcard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full" style={{ perspective: "1000px" }}>
      <div
        className="relative w-full transition-transform duration-500 transform-gpu cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={handleFlip}
      >
        {/* Front Side */}
        <div
          className="w-full bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <div className="flex items-center justify-between">
            <div className="bg-slate-100 dark:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300 rounded px-4 py-1 uppercase">
              {flashcard?.difficulty}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStar(flashcard._id); }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                flashcard.isStarred
                  ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/25"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-amber-500"
              }`}
            >
              <Star className="w-4 h-4" strokeWidth={2} fill={flashcard.isStarred ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="min-h-32 flex items-center justify-center px-2 py-4">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 text-center leading-relaxed">
              {flashcard.question}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Click to reveal answer</span>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 w-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStar(flashcard._id); }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                flashcard.isStarred
                  ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/25"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-amber-500"
              }`}
            >
              <Star className="w-4 h-4" strokeWidth={2} fill={flashcard.isStarred ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="min-h-32 flex items-center justify-center px-2 py-4">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 text-center leading-relaxed">
              {flashcard.answer}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Click to see question</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;