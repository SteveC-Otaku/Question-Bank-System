# Test Accounts for MongoDB Question Bank System

This file contains test accounts for different user roles in the system.

## Test Accounts

### Student Account
- **Username:** `TestStu`
- **Password:** `123123123`
- **Role:** Student
- **Permissions:** View questions, search/filter, code testing

### Teacher Account
- **Username:** `TestTea`
- **Password:** `123123123`
- **Role:** Teacher
- **Permissions:** All student permissions + create/edit questions, import/export, view statistics

### Admin Account
- **Username:** `TestAdm`
- **Password:** `123123123`
- **Role:** Admin
- **Permissions:** All teacher permissions + delete questions, user management

## How to Use

1. Start the server: `npm start`
2. Navigate to: `http://localhost:3000`
3. Use any of the above accounts to login
4. Test different features based on the account role

## Account Creation

If these accounts don't exist in your database, you can create them by:

1. Going to the registration page
2. Using the above credentials to register new accounts
3. Or use the demo data import feature if available

## Security Note

⚠️ **Important:** These are test accounts only. Do not use these credentials in production environments. Change all passwords before deploying to production.

## Role Permissions Summary

| Feature | Student | Teacher | Admin |
|---------|---------|---------|-------|
| View Questions | ✅ | ✅ | ✅ |
| Search/Filter | ✅ | ✅ | ✅ |
| Code Testing | ✅ | ✅ | ✅ |
| Create Questions | ❌ | ✅ | ✅ |
| Edit Questions | ❌ | ✅ | ✅ |
| Delete Questions | ❌ | ❌ | ✅ |
| Import/Export | ❌ | ✅ | ✅ |
| View Statistics | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |

---
*Generated for testing purposes - MongoDB Question Bank System*

