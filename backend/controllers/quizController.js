import Quiz from '../models/Quiz.js';

export const getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
        .populate('documentId', 'title')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
};

export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};

export const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide answers as an array',
                statusCode: 400
            });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.quizId,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if (quiz.isCompleted) {
            return res.status(400).json({
                success: false,
                error: 'Quiz has already been completed',
                statusCode: 400
            });
        }

        let correctCount = 0;
        const userAnswers = [];

        answers.forEach((answer) => {
            const { questionIndex, selectedAnswer } = answer;

            if (questionIndex < quiz.questions.length) {
                const question = quiz.questions[questionIndex];
                const isCorrect = question.correctAnswer === selectedAnswer;
                if (isCorrect) correctCount++;

                userAnswers.push({
                    questionIndex,
                    selectedAnswer,
                    isCorrect,
                });
            }
        });

        const score = Math.round((correctCount / quiz.questions.length) * 100);

        quiz.userAnswers = userAnswers;
        quiz.score = score;
        quiz.isCompleted = true;
        quiz.completedAt = new Date();
        await quiz.save();

        res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                score,
                correctCount,
                totalQuestions: quiz.totalQuestions,
                percentage: score,
                userAnswers
            },
            message: 'Quiz submitted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.quizId,
            userId: req.user._id
        }).populate('documentId', 'title');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if (!quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: 'Quiz has not been completed yet',
                statusCode: 400
            });
        }

        const detailedResults = quiz.questions.map((question, index) => {
            const userAnswer = quiz.userAnswers.find(a => a.questionIndex === index);

            return {
                questionIndex: index,
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedAnswer: userAnswer?.selectedAnswer || null,
                isCorrect: userAnswer?.isCorrect || false,
                explanation: question.explanation
            };
        });

        res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: quiz._id,
                    title: quiz.title,
                    document: quiz.documentId,
                    score: quiz.score,
                    totalQuestions: quiz.totalQuestions,
                    completedAt: quiz.completedAt
                },
                results: detailedResults
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const renameQuiz = async (req, res, next) => {
    try {
        const { title } = req.body;
        const quiz = await Quiz.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { title },
            { new: true }
        );
        if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });
        res.status(200).json({ success: true, data: quiz });
    } catch (error) {
        next(error);
    }
};