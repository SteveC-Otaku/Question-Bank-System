const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Test Java code - all authenticated users can test code
router.post('/java', authenticateToken, async (req, res) => {
    try {
        const { code, testCases } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'No code provided' });
        }

        // Check if Java is available
        const javaAvailable = await checkJavaAvailability();
        if (!javaAvailable) {
            return res.status(400).json({ 
                error: 'Java development environment not found. Please install Java JDK to test Java code.',
                details: 'Java compiler (javac) is not available in the system PATH. Please install OpenJDK or Oracle JDK.'
            });
        }

        const testDir = path.join(__dirname, '../temp', uuidv4());
        await fs.ensureDir(testDir);

        // Create Java file
        const javaFileName = 'TestCode.java';
        const javaFilePath = path.join(testDir, javaFileName);
        
        // Wrap code in a class if it's not already
        let javaCode = code;
        if (!javaCode.includes('public class')) {
            javaCode = `public class TestCode {
    public static void main(String[] args) {
        ${code}
    }
}`;
        }

        await fs.writeFile(javaFilePath, javaCode);

        // Compile Java code
        const compileResult = await compileJava(javaFilePath);
        
        if (!compileResult.success) {
            await fs.remove(testDir);
            return res.json({
                success: false,
                error: 'Compilation failed',
                details: compileResult.error
            });
        }

        // Run test cases
        const testResults = [];
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const result = await runJavaTest(javaFilePath.replace('.java', ''), testCase);
            testResults.push({
                testCase: i + 1,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: result.output,
                passed: result.passed,
                error: result.error
            });
        }

        // Clean up
        await fs.remove(testDir);

        res.json({
            success: true,
            compilationSuccess: true,
            testResults: testResults,
            summary: {
                total: testResults.length,
                passed: testResults.filter(r => r.passed).length,
                failed: testResults.filter(r => !r.passed).length
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test Python code - all authenticated users can test code
router.post('/python', authenticateToken, async (req, res) => {
    try {
        const { code, testCases } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'No code provided' });
        }

        const testDir = path.join(__dirname, '../temp', uuidv4());
        await fs.ensureDir(testDir);

        // Create Python file
        const pythonFileName = 'test_code.py';
        const pythonFilePath = path.join(testDir, pythonFileName);
        
        // Clean the code - remove any leading/trailing whitespace and fix indentation
        const cleanCode = code.trim().split('\n').map(line => line.trim()).join('\n');
        
        // Ensure the directory exists and write with proper encoding
        await fs.ensureDir(path.dirname(pythonFilePath));
        await fs.writeFile(pythonFilePath, cleanCode, { encoding: 'utf8' });
        
        console.log('Python file created:', pythonFilePath);
        console.log('File content:', cleanCode);

        // Run test cases
        const testResults = [];
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const result = await runPythonTest(pythonFilePath, testCase);
            testResults.push({
                testCase: i + 1,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: result.output,
                passed: result.passed,
                error: result.error
            });
        }

        // Clean up
        await fs.remove(testDir);

        res.json({
            success: true,
            testResults: testResults,
            summary: {
                total: testResults.length,
                passed: testResults.filter(r => r.passed).length,
                failed: testResults.filter(r => !r.passed).length
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Helper functions
async function checkJavaAvailability() {
    return new Promise((resolve) => {
        const javac = spawn('javac', ['-version']);
        
        javac.on('close', (code) => {
            resolve(code === 0);
        });
        
        javac.on('error', (err) => {
            resolve(false);
        });
    });
}

async function compileJava(javaFilePath) {
    return new Promise((resolve) => {
        const javac = spawn('javac', [javaFilePath]);
        
        let errorOutput = '';
        
        javac.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        javac.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true });
            } else {
                resolve({ success: false, error: errorOutput });
            }
        });
    });
}

async function runJavaTest(classPath, testCase) {
    return new Promise((resolve) => {
        const java = spawn('java', ['-cp', path.dirname(classPath), 'TestCode']);
        
        let output = '';
        let errorOutput = '';
        
        java.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        java.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        java.on('close', (code) => {
            const actualOutput = output.trim();
            const expectedOutput = testCase.expectedOutput.trim();
            const passed = actualOutput === expectedOutput;
            
            resolve({
                output: actualOutput,
                error: errorOutput || null,
                passed: passed
            });
        });
        
        // Send input if provided
        if (testCase.input) {
            java.stdin.write(testCase.input);
            java.stdin.end();
        }
    });
}

async function runPythonTest(pythonFilePath, testCase) {
    return new Promise((resolve) => {
        console.log('=== Starting Python Test ===');
        console.log('File path:', pythonFilePath);
        console.log('Test case input:', JSON.stringify(testCase.input));
        console.log('Expected output:', JSON.stringify(testCase.expectedOutput));
        
        const python = spawn('py', [pythonFilePath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let errorOutput = '';
        let timeoutId;
        let inputSent = false;
        
        // Set timeout (15 seconds)
        timeoutId = setTimeout(() => {
            console.log('Python test timeout - killing process');
            python.kill();
            resolve({
                output: '',
                error: 'Code execution timeout (15 seconds)',
                passed: false
            });
        }, 15000);
        
        python.stdout.on('data', (data) => {
            const dataStr = data.toString();
            console.log('Python stdout data:', JSON.stringify(dataStr));
            output += dataStr;
        });
        
        python.stderr.on('data', (data) => {
            const dataStr = data.toString();
            console.log('Python stderr data:', JSON.stringify(dataStr));
            errorOutput += dataStr;
        });
        
        python.on('close', (code) => {
            clearTimeout(timeoutId);
            console.log('Python process closed with exit code:', code);
            console.log('Final output:', JSON.stringify(output));
            console.log('Final error:', JSON.stringify(errorOutput));
            
            const actualOutput = output.trim();
            const expectedOutput = testCase.expectedOutput.trim();
            const passed = actualOutput === expectedOutput;
            
            console.log('Actual output (trimmed):', JSON.stringify(actualOutput));
            console.log('Expected output (trimmed):', JSON.stringify(expectedOutput));
            console.log('Test passed:', passed);
            console.log('=== Python Test Complete ===');
            
            resolve({
                output: actualOutput,
                error: errorOutput || null,
                passed: passed
            });
        });
        
        python.on('error', (err) => {
            clearTimeout(timeoutId);
            console.log('Python process error:', err);
            resolve({
                output: '',
                error: `Process error: ${err.message}`,
                passed: false
            });
        });
        
        // Send input immediately after process starts
        if (testCase.input && !inputSent) {
            inputSent = true;
            console.log('Sending input to Python process...');
            
            // Split input into lines and send each line
            const inputLines = testCase.input.split('\n');
            console.log('Input lines:', inputLines);
            
            // Send all input at once
            const fullInput = testCase.input + '\n';
            console.log('Full input to send:', JSON.stringify(fullInput));
            
            python.stdin.write(fullInput);
            python.stdin.end();
        } else if (!testCase.input) {
            python.stdin.end();
        }
    });
}


// Get supported languages - all authenticated users can view
router.get('/languages', authenticateToken, (req, res) => {
    res.json({
        languages: [
            {
                name: 'Java',
                extension: '.java',
                description: 'Java programming language',
                features: ['Compilation', 'Runtime testing', 'Standard input/output']
            },
            {
                name: 'Python',
                extension: '.py',
                description: 'Python programming language',
                features: ['Interpreted execution', 'Runtime testing', 'Standard input/output']
            },
        ]
    });
});

// Validate code syntax - all authenticated users can validate
router.post('/validate', authenticateToken, async (req, res) => {
    try {
        const { language, code } = req.body;
        
        if (!language || !code) {
            return res.status(400).json({ error: 'Language and code are required' });
        }

        let validationResult = {};
        
        switch (language.toLowerCase()) {
            case 'java':
                validationResult = await validateJavaCode(code);
                break;
            case 'python':
                validationResult = await validatePythonCode(code);
                break;
            default:
                return res.status(400).json({ error: 'Unsupported language' });
        }

        res.json(validationResult);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function validateJavaCode(code) {
    const testDir = path.join(__dirname, '../temp', uuidv4());
    await fs.ensureDir(testDir);
    
    const javaFilePath = path.join(testDir, 'TestCode.java');
    
    // Wrap code in a class if it's not already
    let javaCode = code;
    if (!javaCode.includes('public class')) {
        javaCode = `public class TestCode {
    public static void main(String[] args) {
        ${code}
    }
}`;
    }
    
    await fs.writeFile(javaFilePath, javaCode);
    
    const compileResult = await compileJava(javaFilePath);
    
    // Clean up
    await fs.remove(testDir);
    
    return {
        valid: compileResult.success,
        errors: compileResult.success ? [] : [compileResult.error],
        warnings: []
    };
}

async function validatePythonCode(code) {
    const testDir = path.join(__dirname, '../temp', uuidv4());
    await fs.ensureDir(testDir);
    
    const pythonFilePath = path.join(testDir, 'test_code.py');
    await fs.writeFile(pythonFilePath, code);
    
    return new Promise((resolve) => {
        const python = spawn('py', ['-m', 'py_compile', pythonFilePath]);
        
        let errorOutput = '';
        
        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        python.on('close', async (code) => {
            // Clean up
            await fs.remove(testDir);
            
            resolve({
                valid: code === 0,
                errors: code === 0 ? [] : [errorOutput],
                warnings: []
            });
        });
    });
}


module.exports = router; 