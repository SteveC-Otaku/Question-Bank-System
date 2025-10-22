# MongoDB Question Bank Management System

A comprehensive web-based question bank management system built with Node.js, Express, and MongoDB. This system provides a complete solution for educational institutions to manage questions, test code, and handle user accounts.

## Features

### Question Management
- **Create & Edit Questions**: Support for multiple question types (Multiple Choice, True/False, Short Answer, Programming, Essay)
- **Advanced Filtering**: Filter questions by subject, type, difficulty, and search keywords
- **Pagination**: Efficient navigation through large question sets
- **Question Categories**: Organize questions by subjects and difficulty levels
- **Answer Management**: Add detailed explanations, solutions, and references

### User Management
- **Role-Based Access**: Three user roles (Student, Teacher, Admin)
- **User Authentication**: Secure login/logout with JWT tokens
- **Profile Management**: Users can update their profiles and change passwords
- **Admin Controls**: Comprehensive user account management for administrators

### Code Testing
- **Multi-Language Support**: Python and Java code execution
- **Test Case Management**: Create and manage custom test cases
- **Real-time Execution**: Execute code with input/output testing
- **Error Handling**: Comprehensive error reporting and debugging

### Import/Export
- **File Import**: Import questions from HTML, XML, and TXT files
- **Export Options**: Export questions in multiple formats
- **Batch Operations**: Handle large datasets efficiently

### Dashboard & Analytics
- **Statistics Overview**: Question counts by type, difficulty, and subject
- **Visual Charts**: Interactive charts showing question distribution
- **Activity Tracking**: Monitor system usage and user activity

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication tokens
- **Multer**: File upload handling
- **Child Process**: Code execution

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Bootstrap 5 with custom styling
- **JavaScript (ES6+)**: Modern JavaScript features
- **Chart.js**: Data visualization
- **Font Awesome**: Icons

### Development Tools
- **Nodemon**: Development server
- **Jest**: Testing framework
- **ESLint**: Code linting

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **Java** (for Java code testing)
- **Python** (for Python code testing)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Question-Bank-System
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Make sure MongoDB is running on your system:
```bash
# Start MongoDB service
mongod
```

### 4. Environment Configuration
Create a `.env` file in the root directory (optional):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/question_bank
JWT_SECRET=your-secret-key
```

### 5. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Usage

### Accessing the Application
1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or use existing credentials
3. Choose your role (Student, Teacher, or Admin)

### User Roles & Permissions

#### Student
- View questions and answers
- Search and filter questions
- Test code in the Code Testing section
- Update personal profile

#### Teacher
- All Student permissions
- Create and edit questions
- Add detailed answers and explanations
- Import/export questions
- View dashboard statistics

#### Admin
- All Teacher permissions
- Delete questions
- Manage user accounts
- Full system access

### Code Testing
1. Navigate to the "Code Testing" section
2. Select programming language (Python or Java)
3. Write your code in the editor
4. Add test cases with input and expected output
5. Click "Run Code" to execute and test

### Question Management
1. Go to the "Questions" section
2. Use filters to find specific questions
3. Click "Add Question" to create new questions
4. Use pagination to navigate through questions
5. Edit or delete questions (based on permissions)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Questions
- `GET /api/questions` - Get questions with pagination
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `GET /api/questions/stats/overview` - Get statistics

### Code Testing
- `POST /api/code-test/python` - Test Python code
- `POST /api/code-test/java` - Test Java code
- `GET /api/code-test/languages` - Get supported languages

### Import/Export
- `POST /api/import-export/import` - Import questions
- `POST /api/import-export/export` - Export questions

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Testing

Run the test suite:
```bash
npm test
```

Run system tests:
```bash
npm run test-system
```

## Project Structure

```
Question-Bank-System/
├── middleware/          # Authentication middleware
├── models/             # Database models
├── routes/             # API routes
├── public/             # Frontend files
│   ├── app.js         # Main application logic
│   ├── auth.js        # Authentication handling
│   ├── index.html     # Main application page
│   ├── login.html     # Login page
│   ├── register.html  # Registration page
│   └── styles.css     # Custom styles
├── temp/              # Temporary files for code execution
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Role-Based Access Control**: Granular permission system
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Secure file handling for imports

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in server.js

2. **Code Testing Not Working**
   - Verify Java and Python are installed
   - Check system PATH for executables

3. **File Upload Issues**
   - Ensure temp directory has write permissions
   - Check file size limits

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=app:* npm start
```

## Authors

- **CSIT321 Group 9** 

## Acknowledgments

- Bootstrap for the UI framework
- Chart.js for data visualization
- Font Awesome for icons
- MongoDB for the database solution
- Express.js community for excellent documentation
