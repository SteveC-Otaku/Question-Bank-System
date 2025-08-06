# MongoDB Question Bank Management System

A comprehensive web-based question bank management system designed for lecturers to efficiently manage exam questions with MongoDB database integration.

## Features

### Core Functionality
- **Question Management**: Full CRUD operations for questions
- **Multiple Question Types**: Multiple choice, true/false, short answer, programming, and essay questions
- **File Import/Export**: Support for HTML, XML, and TXT file formats
- **Code Testing**: Java and Python code compilation and testing
- **Advanced Filtering**: Search and filter questions by subject, type, and difficulty
- **Dashboard Analytics**: Visual charts and statistics

### Technical Features
- **Modern Web Interface**: Responsive design with Bootstrap 5
- **Real-time Updates**: Dynamic content loading without page refresh
- **File Upload**: Secure file handling with validation
- **Code Execution**: Safe code testing environment
- **Data Visualization**: Interactive charts using Chart.js

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **Java** (for Java code testing)
- **Python** (for Python code testing)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mongodb-question-bank-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB**
   ```bash
   # On Windows
   mongod
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

4. **Configure environment** (optional)
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/question_bank
   NODE_ENV=development
   ```

## Running the Application

1. **Start the server**
   ```bash
   npm start
   ```

2. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

3. **Development mode** (with auto-restart)
   ```bash
   npm run dev
   ```

## Project Structure

```
mongodb-question-bank-system/
├── models/
│   └── Question.js          # MongoDB schema definition
├── routes/
│   ├── questions.js         # Question CRUD operations
│   ├── importExport.js      # File import/export functionality
│   └── codeTest.js          # Code testing and validation
├── public/
│   ├── index.html           # Main application page
│   ├── styles.css           # Custom CSS styles
│   └── app.js              # Frontend JavaScript
├── uploads/                 # Temporary file upload directory
├── temp/                    # Temporary code execution directory
├── server.js               # Express server configuration
├── package.json            # Project dependencies
└── README.md              # This file
```

## API Endpoints

### Questions
- `GET /api/questions` - Get all questions with pagination and filtering
- `GET /api/questions/:id` - Get a specific question
- `POST /api/questions` - Create a new question
- `PUT /api/questions/:id` - Update a question
- `DELETE /api/questions/:id` - Delete a question
- `GET /api/questions/stats/overview` - Get question statistics
- `GET /api/questions/subjects/list` - Get all subjects

### Import/Export
- `POST /api/import-export/import` - Import questions from file
- `POST /api/import-export/export` - Export questions to file

### Code Testing
- `POST /api/code-test/java` - Test Java code
- `POST /api/code-test/python` - Test Python code
- `POST /api/code-test/validate` - Validate code syntax
- `GET /api/code-test/languages` - Get supported languages

## Usage Guide

### Adding Questions
1. Navigate to the "Questions" section
2. Click "Add Question" button
3. Fill in the question details:
   - Title and content
   - Subject and difficulty
   - Question type (affects available options)
   - For multiple choice: add options and mark correct answer
   - Tags for categorization
4. Click "Save Question"

### Importing Questions
1. Go to "Import/Export" section
2. Select a file (HTML, XML, or TXT format)
3. Click "Import"
4. Review the import results

### Exporting Questions
1. In "Import/Export" section
2. Choose export format (HTML, XML, or TXT)
3. Apply optional filters
4. Click "Export" to download the file

### Code Testing
1. Navigate to "Code Testing" section
2. Select programming language (Java or Python)
3. Enter code in the editor
4. Add test cases with input and expected output
5. Click "Validate Syntax" or "Run Tests"

## File Format Examples

### HTML Import Format
```html
<question>
    <title>What is MongoDB?</title>
    <content>MongoDB is a...</content>
    <type>multiple_choice</type>
    <subject>Database</subject>
    <difficulty>medium</difficulty>
    <options>
        <option correct="true">NoSQL database</option>
        <option correct="false">SQL database</option>
    </options>
</question>
```

### XML Import Format
```xml
<?xml version="1.0" encoding="UTF-8"?>
<questions>
    <question>
        <title>What is MongoDB?</title>
        <content>MongoDB is a...</content>
        <type>multiple_choice</type>
        <subject>Database</subject>
        <difficulty>medium</difficulty>
        <options>
            <option correct="true">NoSQL database</option>
            <option correct="false">SQL database</option>
        </options>
    </question>
</questions>
```

### TXT Import Format
```
Q: What is MongoDB?
A: MongoDB is a NoSQL database that stores data in flexible, JSON-like documents.
OPT: NoSQL database
OPT: SQL database
CORRECT: 1
```

## Security Considerations

- File upload validation for supported formats only
- Temporary file cleanup after processing
- Input sanitization for code execution
- Secure code execution in isolated environment
- Database connection with proper error handling

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in server.js
   - Verify MongoDB installation

2. **Code Testing Not Working**
   - Ensure Java/Python is installed and in PATH
   - Check file permissions for temp directory
   - Verify code syntax

3. **File Upload Issues**
   - Check file format (HTML, XML, TXT only)
   - Ensure uploads directory exists
   - Verify file size limits

### Development

- Use `npm run dev` for development with auto-restart
- Check console for detailed error messages
- Monitor MongoDB logs for database issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Create an issue in the repository

## Team

This project was developed by the CSIT321 team:
- Cheng Chen
- Ziyi Chen
- Shangxin Chen
- Zheyuan Liu
- Mingxuan Sun
- Haisheng Yan

Under the supervision of Dr. Tianbing Xia. 