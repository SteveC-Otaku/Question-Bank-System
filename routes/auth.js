const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, generateToken } = require('../middleware/auth');

// 用户注册
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, role = 'student' } = req.body;

        // 验证必填字段
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // 检查用户名是否已存在
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // 检查邮箱是否已存在
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // 创建新用户
        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            role
        });

        await user.save();

        // 生成token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully',
            user: user.toJSON(),
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});

// 用户登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证必填字段
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 检查用户是否激活
        if (!user.isActive) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }

        // 验证密码
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 更新最后登录时间
        user.lastLogin = Date.now();
        await user.save();

        // 生成token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            user: user.toJSON(),
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
    try {
        res.json({
            user: req.user.toJSON()
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user information' });
    }
});

// 更新用户信息
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;
        const updates = {};

        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (email) {
            // 检查邮箱是否已被其他用户使用
            const existingEmail = await User.findOne({ email, _id: { $ne: req.user._id } });
            if (existingEmail) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            updates.email = email;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser.toJSON()
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// 修改密码
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        // 验证当前密码
        const isValidPassword = await req.user.comparePassword(currentPassword);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // 更新密码
        req.user.password = newPassword;
        await req.user.save();

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// 用户登出（客户端处理，这里只是返回成功消息）
router.post('/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logout successful' });
});

module.exports = router; 