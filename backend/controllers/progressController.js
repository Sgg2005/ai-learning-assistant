import Document from '../models/Document.js';
import FlashCard from '../models/FlashCard.js';
import Quiz from '../models/Quiz.js';

// @desc    Get user dashboard data
// @route   GET /api/progress/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id;

        //get counts
        const totalDocuments = await Document.countDocuments({ userId });
        const totalQuizzes = await Quiz.countDocuments({ userId });
        const completedQuizzes = await Quiz.countDocuments({ userId, isCompleted: true });

        //get flashcard stats
        const flashcardSets = await FlashCard.find({ userId });
        let totalFlashcards = 0;
        let reviewFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach(set => {
            totalFlashcards += set.cards.length;
            reviewFlashcards += set.cards.filter(c => c.reviewCount > 0).length;
            starredFlashcards += set.cards.filter(c => c.isStarred).length;
        });

        //get quiz stats
        const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
        const averageScore = quizzes.length > 0
        ? Math.round(quizzes.reduce((sum, quiz) => sum + quiz.score, 0) / quizzes.length)
        : 0;

        //recent activity
        const recentDocuments = await Document.find({ userId })
        .sort({ uploadDate: -1 })
        .limit(5)
        .select('title uploadDate');

        const recentQuizzes = await Quiz.find ({ userId, completedAt: { $ne: null } })
        .sort({ completedAt: -1 })
        .limit(5)
        .populate('documentId', 'title')
        .select('title score totalQuestions completedAt');

        //study streak (simplified - in production, track daily activity)
        const studyStreak = Math.floor(Math.random() * 7) + 1; // Random streak between 1 and 7 days

        res.status(200).json({
            success: true,
            data : {
                overview: {
                    totalDocuments,
                    totalFlashcardSets: flashcardSets.length,
                    totalFlashcards,
                    reviewFlashcards,
                    starredFlashcards,
                    totalQuizzes,
                    completedQuizzes,
                    averageScore,
                    studyStreak
                },
                recentActivity: {
                    documents: recentDocuments,
                    quizzes: recentQuizzes
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
