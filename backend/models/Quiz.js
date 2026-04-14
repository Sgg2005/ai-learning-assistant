import mongoose from "mongoose";

const arrayLimit = (val) => val.length >= 2;

const quizSchema = new mongoose.Schema({
    userId: {                              
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true]
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
        question: { type: String, required: [true] },
        options: {
            type: [String],
            required: [true],
            validate: [arrayLimit, 'A quiz must have at least 2 options']
        },
        correctAnswer: { type: String, required: [true] },
        explanation: { type: String, default: '' },  
        difficulty: {                                 
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        }
    }],
    userAnswers: [{
        questionIndex: { type: Number, required: [true] },
        selectedAnswer: { type: String, required: [true] },
        isCorrect: { type: Boolean, required: [true] },
    }],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    isCompleted: { type: Boolean, default: false },  
    completedAt: { type: Date, default: null }
}, {
    timestamps: true
});

quizSchema.index({ documentId: 1, userId: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;