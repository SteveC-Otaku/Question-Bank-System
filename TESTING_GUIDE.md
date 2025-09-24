# Testing Guide - MongoDB Question Bank System

This guide explains how to use the test accounts to test different features of the system.

## Quick Start

### 1. Create Test Accounts
```bash
npm run create-test-accounts
```

### 2. Start the Server
```bash
npm start
```

### 3. Access the Application
Open your browser and go to: `http://localhost:3000`

## Test Accounts

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| TestStu | 123123123 | Student | Test basic viewing and code testing features |
| TestTea | 123123123 | Teacher | Test content management and import/export |
| TestAdm | 123123123 | Admin | Test full system functionality including deletion |

## Testing Scenarios

### Student Account (TestStu)
**What to test:**
- ✅ Login and view dashboard
- ✅ Browse questions in Questions section
- ✅ Use search and filter functionality
- ✅ View individual question details
- ✅ Test code in Code Testing section
- ❌ Should NOT see: Add Question button, Import/Export section, Statistics

### Teacher Account (TestTea)
**What to test:**
- ✅ All student features
- ✅ Create new questions
- ✅ Edit existing questions
- ✅ Add/edit question answers
- ✅ Import questions from files
- ✅ Export questions to files
- ✅ View dashboard statistics
- ❌ Should NOT see: Delete question buttons

### Admin Account (TestAdm)
**What to test:**
- ✅ All teacher features
- ✅ Delete questions
- ✅ Full system access
- ✅ All administrative functions
- ✅ User Account Management
  - View all users in the system
  - Create new user accounts
  - Edit user information and roles
  - Activate/deactivate user accounts
  - Delete user accounts
  - Search for users

## Feature Testing Checklist

### Authentication & Profile
- [ ] Login with each test account
- [ ] View profile information
- [ ] Edit profile details
- [ ] Change password
- [ ] Logout functionality

### Question Management
- [ ] View questions list
- [ ] Search questions
- [ ] Filter by subject/type/difficulty
- [ ] View question details
- [ ] Create new questions (Teacher/Admin only)
- [ ] Edit questions (Teacher/Admin only)
- [ ] Delete questions (Admin only)
- [ ] Add/edit answers (Teacher/Admin only)

### Import/Export
- [ ] Import questions from HTML/XML/TXT files (Teacher/Admin only)
- [ ] Export questions to different formats (Teacher/Admin only)
- [ ] View import/export results

### Code Testing
- [ ] Write and test Python code
- [ ] Write and test Java code
- [ ] Validate code syntax
- [ ] Run test cases
- [ ] Debug mode functionality

### Dashboard & Statistics
- [ ] View dashboard overview (Teacher/Admin only)
- [ ] Check question statistics
- [ ] View charts and graphs

### User Management (Admin Only)
- [ ] Access User Management section
- [ ] View all users in table format
- [ ] Create new user accounts
- [ ] Edit user information
- [ ] Change user roles
- [ ] Activate/deactivate accounts
- [ ] Delete user accounts
- [ ] Search for users

## Troubleshooting

### Common Issues

1. **Cannot login with test accounts**
   - Make sure you've run `npm run create-test-accounts`
   - Check if MongoDB is running
   - Verify server is started with `npm start`

2. **Missing features for role**
   - Check if you're logged in with the correct account
   - Verify the account role in the database
   - Clear browser cache and try again

3. **Import/Export not working**
   - Ensure you're logged in as Teacher or Admin
   - Check file format (HTML, XML, or TXT)
   - Verify file size and content

### Database Reset
If you need to reset the test accounts:
```bash
# Stop the server first (Ctrl+C)
npm run create-test-accounts
```

## Security Notes

⚠️ **Important Security Reminders:**
- These are TEST accounts only
- Do NOT use these credentials in production
- Change all passwords before deployment
- Remove test accounts from production database

## Support

If you encounter issues during testing:
1. Check the browser console for errors
2. Check the server console for error messages
3. Verify MongoDB connection
4. Ensure all dependencies are installed

---
*Happy Testing! 🧪*
