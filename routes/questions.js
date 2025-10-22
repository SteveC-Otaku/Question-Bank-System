const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// GET all questions with filtering and pagination
// All authenticated users can view questions
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, subject, type, difficulty, search } = req.query;
        
        let query = {};
        
        // Apply filters
        if (subject) query.subject = subject;
        if (type) query.type = type;
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        const questions = await Question.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });
            
        const total = await Question.countDocuments(query);
        
        res.json({
            questions,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single question by ID
// All authenticated users can view individual questions
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new question
// Only teachers and admins can create questions
router.post('/', authenticateToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
    try {
        const questionData = {
            ...req.body,
            createdBy: req.user.id
        };
        const question = new Question(questionData);
        const savedQuestion = await question.save();
        res.status(201).json(savedQuestion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update question
// Only teachers and admins can update questions
router.put('/:id', authenticateToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: req.user.id
        };
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE question
// Only admins can delete questions
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET subjects list
// All authenticated users can view subjects
router.get('/subjects/list', authenticateToken, async (req, res) => {
    try {
        const subjects = await Question.distinct('subject');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET question statistics
// Only teachers and admins can view statistics
router.get('/stats/overview', authenticateToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
    try {
        const totalQuestions = await Question.countDocuments();
        const questionsByType = await Question.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);
        const questionsByDifficulty = await Question.aggregate([
            { $group: { _id: '$difficulty', count: { $sum: 1 } } }
        ]);
        const questionsBySubject = await Question.aggregate([
            { $group: { _id: '$subject', count: { $sum: 1 } } }
        ]);
        
        res.json({
            totalQuestions,
            byType: questionsByType,
            byDifficulty: questionsByDifficulty,
            bySubject: questionsBySubject
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 