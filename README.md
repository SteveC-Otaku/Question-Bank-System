# MongoDB Question Bank Management System

A web-based MongoDB question bank management system designed for lecturers, supporting multiple question types and code testing functionality.

## Project Overview

A comprehensive question bank management system that allows lecturers to create, manage, and organize various types of questions including multiple choice, true/false, short answer, programming, and essay questions. The system also integrates code testing functionality supporting online compilation and testing of multiple programming languages.

## Key Features

- **User Management**: Multi-role user system (students, teachers, administrators)
- **Question Management**: Support for multiple choice, true/false, short answer, programming, and essay questions
- **Code Testing**: Support for Java, Python, and JavaScript online compilation and execution
- **Import/Export**: Support for bulk question management in multiple formats

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap
- **Development Tools**: nodemon, Jest

## Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (v6+)
- Git

### Installation Steps

1. **Install Dependencies**
   - **Windows**: Download and install [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/try/download/community)
   - **macOS**: `brew install node mongodb-community`
   - **Linux**: `sudo apt-get install nodejs mongodb-org`

2. **Clone and Install Project**
   ```bash
   git clone https://github.com/SteveC-Otaku/Question-Bank-System.git
   cd Question-Bank-System
   npm install
   ```

3. **Start Application**
   ```bash
   npm start
   ```

4. **Access Application**
   - Open browser and visit: `http://localhost:3000`
   - Register a new account and start using

## Usage

### Teacher Features
- Create and manage various question types
- Bulk import/export questions
- Code testing functionality

### Student Features
- Browse and answer questions
- Online code practice

## Project Structure

```
project/
├── server.js                 # Main server file
├── models/                   # Data models
├── routes/                   # API routes
├── middleware/               # Middleware
├── public/                   # Frontend files
└── uploads/                  # File upload directory
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/questions` - Get question list
- `POST /api/questions` - Create new question
- `POST /api/import-export/import` - Import questions
- `POST /api/code-test/execute` - Execute code

## Security Features

- Password encryption storage
- JWT token authentication
- Input validation and sanitization

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key

---

**Note**: This is an educational project, recommended for use in development environments.
