// Test if routes are loading correctly
console.log('Testing route loading...');

try {
    console.log('Loading user routes...');
    const userRoutes = require('./routes/users');
    console.log('✅ User routes loaded successfully');
    console.log('User routes:', userRoutes);
} catch (error) {
    console.error('❌ Error loading user routes:', error);
}

try {
    console.log('Loading auth middleware...');
    const auth = require('./middleware/auth');
    console.log('✅ Auth middleware loaded successfully');
    console.log('Auth middleware:', auth);
} catch (error) {
    console.error('❌ Error loading auth middleware:', error);
}

try {
    console.log('Loading User model...');
    const User = require('./models/User');
    console.log('✅ User model loaded successfully');
} catch (error) {
    console.error('❌ Error loading User model:', error);
}

