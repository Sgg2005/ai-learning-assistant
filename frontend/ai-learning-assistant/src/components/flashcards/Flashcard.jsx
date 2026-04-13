import { useState } from "react";
import { Star, RotateCcw } from "lucide-react";

const Flashcard = ({ flashcard, onToggleStar }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="w-full h-64" style={{ perspective: "1000px" }}>
            <div
                className="relative w-full h-full transition-transform duration-500 transform-gpu cursor-pointer"
                style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
                onClick={handleFlip}
            >
                {/* Front Side of Flashcard */}
                <div
                    className="absolute inset-0 bg-white border border-orange-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm"
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                    }}
                >
                    {/* Star Button */}
                    <div className="flex items-center justify-between">
                        <div className="bg-slate-100 text-[10px] text-slate-600 rounded px-4 py-1 uppercase">{flashcard?.difficulty}</div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStar(flashcard._id);
                            }}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                flashcard.isStarred
                                    ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/25'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-500'
                            }`}
                        >
                            <Star
                                className="w-4 h-4"
                                strokeWidth={2}
                                fill={flashcard.isStarred ? 'currentColor' : 'none'}
                            />
                        </button>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 flex items-center justify-center px-2 py-4">
                        <p className="text-base font-medium text-slate-800 text-center leading-relaxed">
                            {flashcard.question}
                        </p>
                    </div>

                    {/* Flip Indicator */}
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                        <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Click to reveal answer</span>
                    </div>
                </div>

                {/* Back side of the flashcard */}
                <div
                  className="absolute inset-0 bg-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    }}
                >
                    {/* Star button */}
                    <div className="flex items-center justify-end">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStar(flashcard._id);
                            }}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                flashcard.isStarred
                                    ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/25'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-500'
                            }`}
                        >
                            <Star
                                className="w-4 h-4"
                                strokeWidth={2}
                                fill={flashcard.isStarred ? 'currentColor' : 'none'}
                            />
                        </button>
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1 flex items-center justify-center px-2 py-4">
                        <p className="text-base font-medium text-slate-800 text-center leading-relaxed">
                            {flashcard.answer}
                        </p>
                    </div>

                    {/* Flip Indicator */}
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                        <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Click to see question</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Flashcard;