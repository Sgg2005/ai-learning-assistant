import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        ref: 'User',
        required: [true, 'Please add a title for the quiz']
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: [true]
    },
    title: {
        type: String,
        required: [true],
        trim: true
    },
    questions: [{
        question: {
            type: String,
            required: [true]
        },
        options: {
            type: [String],
            required: [true],
            validate: [arrayLimit, 'A quiz must have at least 2 options']
        },
        correctAnswer: {
            type: String,
            required: [true]
        },
        explaination: {
            type: String,
            default: ''
        },
        diffculty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        }
    }],
    userAnswers: [{
        questionIndex: {
            type: Number,
            required: [true]
        },
        selectedAnswer: {
            type: String,
            required: [true]
        },
        isCorrect: {
            type: Boolean,
            required: [true]
        },
    }],
    score: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

//index for faster queries
quizSchema.index({ documentId: 1, userId: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
