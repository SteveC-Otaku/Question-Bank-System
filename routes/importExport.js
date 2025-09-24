const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const Question = require('../models/Question');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        fs.ensureDirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['text/html', 'text/xml', 'text/plain'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only HTML, XML, and TXT files are allowed.'));
        }
    }
});

// Import questions from file
// Import questions - only teachers and admins can import
router.post('/import', authenticateToken, authorizeRole(['teacher', 'admin']), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        let questions = [];

        switch (fileExtension) {
            case '.html':
                questions = await parseHTMLFile(filePath);
                break;
            case '.xml':
                questions = await parseXMLFile(filePath);
                break;
            case '.txt':
                questions = await parseTXTFile(filePath);
                break;
            default:
                return res.status(400).json({ error: 'Unsupported file format' });
        }

        // Save questions to database
        const savedQuestions = await Question.insertMany(questions);
        
        // Clean up uploaded file
        await fs.remove(filePath);

        res.json({
            message: `Successfully imported ${savedQuestions.length} questions`,
            importedCount: savedQuestions.length,
            questions: savedQuestions
        });

    } catch (error) {
        // Clean up file on error
        if (req.file) {
            await fs.remove(req.file.path);
        }
        res.status(500).json({ error: error.message });
    }
});

// Export questions to file
// Export questions - only teachers and admins can export
router.post('/export', authenticateToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
    try {
        const { format, filters } = req.body;
        
        // Build query based on filters
        let query = {};
        if (filters) {
            if (filters.subject) query.subject = filters.subject;
            if (filters.type) query.type = filters.type;
            if (filters.difficulty) query.difficulty = filters.difficulty;
        }

        const questions = await Question.find(query);
        
        let exportData;
        let contentType;
        let filename;

        switch (format.toLowerCase()) {
            case 'html':
                exportData = generateHTMLExport(questions);
                contentType = 'text/html';
                filename = 'questions_export.html';
                break;
            case 'xml':
                exportData = generateXMLExport(questions);
                contentType = 'application/xml';
                filename = 'questions_export.xml';
                break;
            case 'txt':
                exportData = generateTXTExport(questions);
                contentType = 'text/plain';
                filename = 'questions_export.txt';
                break;
            default:
                return res.status(400).json({ error: 'Unsupported export format' });
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(exportData);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper functions for parsing files
async function parseHTMLFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const $ = cheerio.load(content);
    const questions = [];

    $('question').each((index, element) => {
        const $question = $(element);
        questions.push({
            title: $question.find('title').text().trim(),
            content: $question.find('content').text().trim(),
            type: $question.find('type').text().trim() || 'multiple_choice',
            subject: $question.find('subject').text().trim(),
            difficulty: $question.find('difficulty').text().trim() || 'medium',
            options: parseOptions($question.find('options')),
            correctAnswer: $question.find('correctAnswer').text().trim(),
            programmingLanguage: $question.find('programmingLanguage').text().trim() || 'none',
            testCases: parseTestCases($question.find('testCases')),
            tags: $question.find('tags').text().split(',').map(tag => tag.trim())
        });
    });

    return questions;
}

async function parseXMLFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(content);
    
    const questions = [];
    if (result.questions && result.questions.question) {
        result.questions.question.forEach(q => {
            questions.push({
                title: q.title[0],
                content: q.content[0],
                type: q.type ? q.type[0] : 'multiple_choice',
                subject: q.subject[0],
                difficulty: q.difficulty ? q.difficulty[0] : 'medium',
                options: parseXMLOptions(q.options),
                correctAnswer: q.correctAnswer ? q.correctAnswer[0] : '',
                programmingLanguage: q.programmingLanguage ? q.programmingLanguage[0] : 'none',
                testCases: parseXMLTestCases(q.testCases),
                tags: q.tags ? q.tags[0].tag : []
            });
        });
    }
    
    return questions;
}

async function parseTXTFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const questions = [];
    const lines = content.split('\n');
    
    let currentQuestion = {};
    let inQuestion = false;
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        if (line.startsWith('Q:')) {
            if (inQuestion && Object.keys(currentQuestion).length > 0) {
                questions.push(currentQuestion);
            }
            currentQuestion = {
                title: line.substring(2).trim(),
                content: '',
                type: 'multiple_choice',
                subject: 'General',
                difficulty: 'medium',
                options: [],
                tags: []
            };
            inQuestion = true;
        } else if (line.startsWith('A:') && inQuestion) {
            currentQuestion.content = line.substring(2).trim();
        } else if (line.startsWith('OPT:') && inQuestion) {
            const optionText = line.substring(4).trim();
            currentQuestion.options.push({ text: optionText, isCorrect: false });
        } else if (line.startsWith('CORRECT:') && inQuestion) {
            const correctIndex = parseInt(line.substring(8).trim()) - 1;
            if (currentQuestion.options[correctIndex]) {
                currentQuestion.options[correctIndex].isCorrect = true;
            }
        }
    }
    
    if (inQuestion && Object.keys(currentQuestion).length > 0) {
        questions.push(currentQuestion);
    }
    
    return questions;
}

// Helper functions for export generation
function generateHTMLExport(questions) {
    let html = `<!DOCTYPE html>
<html>
<head>
    <title>Question Bank Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .question { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
        .question-title { font-weight: bold; color: #333; }
        .question-content { margin: 10px 0; }
        .options { margin: 10px 0; }
        .option { margin: 5px 0; }
        .correct { color: green; font-weight: bold; }
        .answer { background-color: #f9f9f9; padding: 10px; margin: 10px 0; border-left: 4px solid #007bff; }
        .answer-title { font-weight: bold; color: #007bff; margin-bottom: 10px; }
        .key-points, .references { margin: 5px 0; }
        .key-points ul, .references ul { margin: 5px 0; padding-left: 20px; }
    </style>
</head>
<body>
    <h1>Question Bank Export</h1>
    <p>Total Questions: ${questions.length}</p>`;

    questions.forEach((question, index) => {
        html += `
    <div class="question">
        <div class="question-title">Q${index + 1}: ${question.title}</div>
        <div class="question-content">${question.content}</div>
        <div class="options">`;
        
        if (question.options && question.options.length > 0) {
            question.options.forEach(option => {
                const correctClass = option.isCorrect ? 'correct' : '';
                html += `<div class="option ${correctClass}">• ${option.text}</div>`;
            });
        }
        
        html += `
        </div>
        <div><strong>Subject:</strong> ${question.subject}</div>
        <div><strong>Type:</strong> ${question.type}</div>
        <div><strong>Difficulty:</strong> ${question.difficulty}</div>`;
        
        // 添加答案信息
        if (question.answer && question.answer.explanation) {
            html += `
        <div class="answer">
            <div class="answer-title">📝 Answer</div>
            <div><strong>Explanation:</strong> ${question.answer.explanation}</div>`;
            
            if (question.answer.detailedSolution) {
                html += `<div><strong>Detailed Solution:</strong> ${question.answer.detailedSolution}</div>`;
            }
            
            if (question.answer.keyPoints && question.answer.keyPoints.length > 0) {
                html += `<div class="key-points"><strong>Key Points:</strong><ul>`;
                question.answer.keyPoints.forEach(point => {
                    html += `<li>${point}</li>`;
                });
                html += `</ul></div>`;
            }
            
            if (question.answer.references && question.answer.references.length > 0) {
                html += `<div class="references"><strong>References:</strong><ul>`;
                question.answer.references.forEach(ref => {
                    html += `<li>${ref}</li>`;
                });
                html += `</ul></div>`;
            }
            
            html += `<div><strong>Answer Difficulty:</strong> ${question.answer.difficulty}</div>`;
            html += `</div>`;
        }
        
        html += `
    </div>`;
    });

    html += `
</body>
</html>`;

    return html;
}

function generateXMLExport(questions) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<questions>
    <metadata>
        <totalQuestions>${questions.length}</totalQuestions>
        <exportDate>${new Date().toISOString()}</exportDate>
    </metadata>`;

    questions.forEach(question => {
        xml += `
    <question>
        <title>${escapeXML(question.title)}</title>
        <content>${escapeXML(question.content)}</content>
        <type>${question.type}</type>
        <subject>${escapeXML(question.subject)}</subject>
        <difficulty>${question.difficulty}</difficulty>`;
        
        if (question.options && question.options.length > 0) {
            xml += `
        <options>`;
            question.options.forEach(option => {
                xml += `
            <option correct="${option.isCorrect}">${escapeXML(option.text)}</option>`;
            });
            xml += `
        </options>`;
        }
        
        // 添加答案信息
        if (question.answer && question.answer.explanation) {
            xml += `
        <answer>
            <explanation>${escapeXML(question.answer.explanation)}</explanation>`;
            
            if (question.answer.detailedSolution) {
                xml += `
            <detailedSolution>${escapeXML(question.answer.detailedSolution)}</detailedSolution>`;
            }
            
            if (question.answer.keyPoints && question.answer.keyPoints.length > 0) {
                xml += `
            <keyPoints>`;
                question.answer.keyPoints.forEach(point => {
                    xml += `
                <point>${escapeXML(point)}</point>`;
                });
                xml += `
            </keyPoints>`;
            }
            
            if (question.answer.references && question.answer.references.length > 0) {
                xml += `
            <references>`;
                question.answer.references.forEach(ref => {
                    xml += `
                <reference>${escapeXML(ref)}</reference>`;
                });
                xml += `
            </references>`;
            }
            
            xml += `
            <difficulty>${question.answer.difficulty}</difficulty>
        </answer>`;
        }
        
        xml += `
    </question>`;
    });

    xml += `
</questions>`;

    return xml;
}

function generateTXTExport(questions) {
    let txt = `Question Bank Export
Generated: ${new Date().toISOString()}
Total Questions: ${questions.length}

`;

    questions.forEach((question, index) => {
        txt += `Q${index + 1}: ${question.title}
A: ${question.content}
Subject: ${question.subject}
Type: ${question.type}
Difficulty: ${question.difficulty}

`;

        if (question.options && question.options.length > 0) {
            question.options.forEach((option, optIndex) => {
                const marker = option.isCorrect ? '✓' : '•';
                txt += `OPT${optIndex + 1}: ${marker} ${option.text}
`;
            });
        }
        
        // 添加答案信息
        if (question.answer && question.answer.explanation) {
            txt += `ANSWER:
Explanation: ${question.answer.explanation}
`;
            
            if (question.answer.detailedSolution) {
                txt += `Detailed Solution: ${question.answer.detailedSolution}
`;
            }
            
            if (question.answer.keyPoints && question.answer.keyPoints.length > 0) {
                txt += `Key Points:
`;
                question.answer.keyPoints.forEach(point => {
                    txt += `• ${point}
`;
                });
            }
            
            if (question.answer.references && question.answer.references.length > 0) {
                txt += `References:
`;
                question.answer.references.forEach(ref => {
                    txt += `• ${ref}
`;
                });
            }
            
            txt += `Answer Difficulty: ${question.answer.difficulty}
`;
        }
        
        txt += `---\n\n`;
    });

    return txt;
}

// Helper functions
function parseOptions($options) {
    const options = [];
    $options.find('option').each((index, element) => {
        const $option = $(element);
        options.push({
            text: $option.text().trim(),
            isCorrect: $option.attr('correct') === 'true'
        });
    });
    return options;
}

function parseTestCases($testCases) {
    const testCases = [];
    $testCases.find('testCase').each((index, element) => {
        const $testCase = $(element);
        testCases.push({
            input: $testCase.find('input').text().trim(),
            expectedOutput: $testCase.find('expectedOutput').text().trim(),
            description: $testCase.find('description').text().trim()
        });
    });
    return testCases;
}

function parseXMLOptions(options) {
    if (!options || !options[0] || !options[0].option) return [];
    
    return options[0].option.map(opt => ({
        text: opt._,
        isCorrect: opt.$.correct === 'true'
    }));
}

function parseXMLTestCases(testCases) {
    if (!testCases || !testCases[0] || !testCases[0].testCase) return [];
    
    return testCases[0].testCase.map(tc => ({
        input: tc.input[0],
        expectedOutput: tc.expectedOutput[0],
        description: tc.description ? tc.description[0] : ''
    }));
}

function escapeXML(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

module.exports = router; 