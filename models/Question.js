const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['multiple_choice', 'true_false', 'short_answer', 'programming', 'essay'],
        default: 'multiple_choice'
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    options: [{
        text: String,
        isCorrect: Boolean
    }],
    correctAnswer: {
        type: String,
        required: function() {
            return this.type === 'short_answer' || this.type === 'essay';
        }
    },
    // 新增答案相关字段
    answer: {
        explanation: {
            type: String,
            default: ''
        },
        detailedSolution: {
            type: String,
            default: ''
        },
        keyPoints: [String],
        references: [String],
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        }
    },
    programmingLanguage: {
        type: String,
        enum: ['java', 'python', 'javascript', 'none'],
        default: 'none'
    },
    testCases: [{
        input: String,
        expectedOutput: String,
        description: String
    }],
    tags: [String],
    createdBy: {
        type: String,
        default: 'lecturer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
questionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Question', questionSchema); 