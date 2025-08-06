# 📥 Import Format Guide

## 🎯 Overview

The question bank management system supports three file formats for question import: **HTML**, **XML**, and **TXT**. Each format has specific structural requirements to ensure the system can correctly identify and parse question content.

## 📋 Supported Formats

### 1. **HTML Format** (.html)
- Uses HTML tag structure
- Supports complex question formats
- Suitable for questions with rich text content

### 2. **XML Format** (.xml)
- Uses XML tag structure
- Standardized data format
- Suitable for batch import

### 3. **TXT Format** (.txt)
- Plain text format
- Simple markup syntax
- Suitable for quick import

## 📝 Detailed Format Specifications

### 🔤 HTML Format Requirements

#### Basic Structure
```html
<question>
    <title>Question Title</title>
    <content>Question Content</content>
    <type>Question Type</type>
    <subject>Subject</subject>
    <difficulty>Difficulty</difficulty>
    <options>
        <option correct="true">Correct Answer</option>
        <option correct="false">Wrong Option 1</option>
        <option correct="false">Wrong Option 2</option>
        <option correct="false">Wrong Option 3</option>
    </options>
    <correctAnswer>Correct Answer Text</correctAnswer>
    <programmingLanguage>Programming Language</programmingLanguage>
    <testCases>
        <testCase>
            <input>Input Value</input>
            <expectedOutput>Expected Output</expectedOutput>
            <description>Test Description</description>
        </testCase>
    </testCases>
    <tags>tag1,tag2,tag3</tags>
</question>
```

#### Required Fields
- `title`: Question title
- `content`: Question content
- `type`: Question type (multiple_choice, true_false, short_answer, programming, essay)
- `subject`: Subject name
- `difficulty`: Difficulty level (easy, medium, hard)

#### Optional Fields
- `options`: Multiple choice options (required for multiple choice questions)
- `correctAnswer`: Correct answer (required for short answer and essay questions)
- `programmingLanguage`: Programming language (required for programming questions)
- `testCases`: Test cases (required for programming questions)
- `tags`: Tags (comma-separated)

#### Complete Example
```html
<question>
    <title>JavaScript Variable Declaration</title>
    <content>What is the scope of variables declared with the 'let' keyword in JavaScript?</content>
    <type>multiple_choice</type>
    <subject>Computer Science</subject>
    <difficulty>easy</difficulty>
    <options>
        <option correct="true">Block scope</option>
        <option correct="false">Function scope</option>
        <option correct="false">Global scope</option>
        <option correct="false">No scope restrictions</option>
    </options>
    <tags>javascript,variables,ES6,basics</tags>
</question>
```

### 🔤 XML Format Requirements

#### Basic Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<questions>
    <question>
        <title>Question Title</title>
        <content>Question Content</content>
        <type>Question Type</type>
        <subject>Subject</subject>
        <difficulty>Difficulty</difficulty>
        <options>
            <option correct="true">Correct Answer</option>
            <option correct="false">Wrong Option 1</option>
            <option correct="false">Wrong Option 2</option>
            <option correct="false">Wrong Option 3</option>
        </options>
        <correctAnswer>Correct Answer Text</correctAnswer>
        <programmingLanguage>Programming Language</programmingLanguage>
        <testCases>
            <testCase>
                <input>Input Value</input>
                <expectedOutput>Expected Output</expectedOutput>
                <description>Test Description</description>
            </testCase>
        </testCases>
        <tags>
            <tag>tag1</tag>
            <tag>tag2</tag>
            <tag>tag3</tag>
        </tags>
    </question>
</questions>
```

#### Complete Example
```xml
<?xml version="1.0" encoding="UTF-8"?>
<questions>
    <question>
        <title>Python Recursive Function</title>
        <content>Write a Python function to calculate factorial</content>
        <type>programming</type>
        <subject>Computer Science</subject>
        <difficulty>medium</difficulty>
        <programmingLanguage>python</programmingLanguage>
        <testCases>
            <testCase>
                <input>5</input>
                <expectedOutput>120</expectedOutput>
                <description>Calculate factorial of 5</description>
            </testCase>
            <testCase>
                <input>0</input>
                <expectedOutput>1</expectedOutput>
                <description>Calculate factorial of 0</description>
            </testCase>
        </testCases>
        <tags>
            <tag>python</tag>
            <tag>recursion</tag>
            <tag>functions</tag>
        </tags>
    </question>
</questions>
```

### 🔤 TXT Format Requirements

#### Basic Syntax
```
Q: Question Title
A: Question Content
OPT: Option 1
OPT: Option 2
OPT: Option 3
OPT: Option 4
CORRECT: Correct Answer Number
```

#### Field Descriptions
- `Q:` - Question title (required)
- `A:` - Question content (required)
- `OPT:` - Multiple choice options (required for multiple choice questions)
- `CORRECT:` - Correct answer number (required for multiple choice questions, starts from 1)

#### Complete Example
```
Q: JavaScript Variable Hoisting
A: In JavaScript, variables declared with var are hoisted. What is the output of the following code?
console.log(x);
var x = 5;
OPT: 5
OPT: undefined
OPT: Error
OPT: null
CORRECT: 2
```

## 🎯 Question Type Specifications

### 1. **Multiple Choice (multiple_choice)**
- Requires `options` field
- Requires `CORRECT` mark (TXT format)
- Supports 4 options

### 2. **True/False (true_false)**
- Requires `options` field
- Only two options: True/False

### 3. **Short Answer (short_answer)**
- Requires `correctAnswer` field
- No options needed

### 4. **Programming (programming)**
- Requires `programmingLanguage` field
- Requires `testCases` field
- Supports Java and Python

### 5. **Essay (essay)**
- Requires `correctAnswer` field
- No options needed

## ⚠️ Important Notes

### 1. **Encoding Format**
- All files must use **UTF-8** encoding
- Ensure proper display of special characters

### 2. **Required Fields**
- Each question must contain: title, content, type, subject, difficulty
- Fill in the corresponding required fields according to question type

### 3. **Format Validation**
- HTML format: Ensure tags are properly closed
- XML format: Ensure correct XML syntax
- TXT format: Ensure correct markup syntax

### 4. **Special Characters**
- Use HTML entity encoding in XML
- Properly escape special characters in HTML
- Avoid using special markup characters in TXT

## 🔧 Import Steps

### 1. **Prepare Files**
- Create files according to format requirements
- Ensure UTF-8 encoding
- Verify format correctness

### 2. **Upload Files**
- Access the import page
- Select file format
- Upload files

### 3. **Verify Results**
- Check import count
- Verify question content
- Confirm answer correctness

## 📋 Common Errors

### 1. **Format Errors**
- Tags not properly closed
- Missing required fields
- Incorrect encoding format

### 2. **Content Errors**
- Empty question content
- Incorrect number of options
- Wrong correct answer marking

### 3. **System Errors**
- File size exceeds limit
- Unsupported file format
- Server processing error

## 🛠️ Troubleshooting

### 1. **Import Failure**
- Check file format
- Verify required fields
- Confirm encoding format

### 2. **Partial Import**
- Check for error questions
- Fix format issues
- Re-import

### 3. **Encoding Issues**
- Ensure UTF-8 encoding
- Check special characters
- Use standard character set

## 📞 Technical Support

If you encounter import issues:
1. Check if file format meets requirements
2. Verify all required fields are complete
3. Confirm file encoding is UTF-8
4. Check system error logs

---

**Note**: Strictly follow the format requirements when creating import files to ensure the system can correctly identify and parse question content. 