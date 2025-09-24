const mongoose = require('mongoose');
const User = require('./models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/question_bank';

// Test accounts data
const testAccounts = [
    {
        username: 'TestStu',
        password: '123123123',
        role: 'student',
        firstName: 'Test',
        lastName: 'Student',
        email: 'test.student@example.com'
    },
    {
        username: 'TestTea',
        password: '123123123',
        role: 'teacher',
        firstName: 'Test',
        lastName: 'Teacher',
        email: 'test.teacher@example.com'
    },
    {
        username: 'TestAdm',
        password: '123123123',
        role: 'admin',
        firstName: 'Test',
        lastName: 'Admin',
        email: 'test.admin@example.com'
    }
];

async function createTestAccounts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check if accounts already exist
        for (const accountData of testAccounts) {
            const existingUser = await User.findOne({ username: accountData.username });
            
            if (existingUser) {
                console.log(`Account ${accountData.username} already exists. Skipping...`);
                continue;
            }

            // Create new user
            const user = new User(accountData);
            await user.save();
            console.log(`✅ Created test account: ${accountData.username} (${accountData.role})`);
        }

        console.log('\n🎉 Test accounts creation completed!');
        console.log('\nYou can now use these accounts to test the system:');
        console.log('Student: TestStu / 123123123');
        console.log('Teacher: TestTea / 123123123');
        console.log('Admin: TestAdm / 123123123');

    } catch (error) {
        console.error('Error creating test accounts:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
}

// Run the script
if (require.main === module) {
    createTestAccounts();
}

module.exports = { createTestAccounts, testAccounts };
