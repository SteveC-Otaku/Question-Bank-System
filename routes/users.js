const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// GET all users (Admin only)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        
        let query = {};
        
        // Apply search filter
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        const users = await User.find(query)
            .select('-password') // Exclude password from results
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });
            
        const total = await User.countDocuments(query);
        
        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET single user by ID (Admin only)
router.get('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// POST create new user (Admin only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, role, isActive = true } = req.body;

        // Validate required fields
        if (!username || !email || !password || !firstName || !lastName || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            role,
            isActive
        });

        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            user: user.toJSON()
        });

    } catch (error) {
        console.error('Error creating user:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT update user (Admin only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { username, email, firstName, lastName, role, isActive, password } = req.body;
        const updates = {};

        if (username) updates.username = username;
        if (email) updates.email = email;
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (role) updates.role = role;
        if (isActive !== undefined) updates.isActive = isActive;
        if (password) updates.password = password;

        // Check for duplicate username (excluding current user)
        if (username) {
            const existingUsername = await User.findOne({ username, _id: { $ne: req.params.id } });
            if (existingUsername) {
                return res.status(400).json({ error: 'Username already exists' });
            }
        }

        // Check for duplicate email (excluding current user)
        if (email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: req.params.id } });
            if (existingEmail) {
                return res.status(400).json({ error: 'Email already exists' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating user:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE user (Admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// GET user statistics (Admin only)
router.get('/stats/overview', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        
        res.json({
            totalUsers,
            activeUsers,
            inactiveUsers,
            byRole: usersByRole
        });
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
});

module.exports = router;
