// MongoDB Question Bank Management System - Frontend JavaScript

class QuestionBankApp {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilters = {};
        this.charts = {};
        
        // Check authentication
        this.checkAuthentication();
        
        this.init();
    }

    checkAuthentication() {
        // Check if user is authenticated
        if (!window.auth || !window.auth.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Display user information
        this.displayUserInfo();
    }

    displayUserInfo() {
        const user = window.auth.getCurrentUser();
        if (user) {
            const displayName = document.getElementById('userDisplayName');
            if (displayName) {
                displayName.textContent = user.getFullName ? user.getFullName() : `${user.firstName} ${user.lastName}`;
            }
        }
    }

    init() {
        this.setupEventListeners();
        this.loadDashboard();
        this.loadQuestions();
        this.loadSubjects();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.dataset.section);
            });
        });

        // Question management
        document.getElementById('saveQuestion').addEventListener('click', () => this.saveQuestion());
        document.getElementById('addOption').addEventListener('click', () => this.addOption());
        document.getElementById('questionType').addEventListener('change', () => this.handleQuestionTypeChange());

        // Answer management
        document.getElementById('saveAnswer').addEventListener('click', () => this.saveAnswer());
        document.getElementById('viewQuestionAddAnswer').addEventListener('click', () => this.viewQuestionAddAnswer());

        // Filters
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('subjectFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('typeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('difficultyFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        // Import/Export
        document.getElementById('importForm').addEventListener('submit', (e) => this.handleImport(e));
        document.getElementById('exportForm').addEventListener('submit', (e) => this.handleExport(e));

        // Code testing
        document.getElementById('validateCode').addEventListener('click', () => this.validateCode());
        document.getElementById('runTests').addEventListener('click', () => this.runTests());
        document.getElementById('addTestCase').addEventListener('click', () => this.addTestCase());
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName).classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Load section-specific data
        switch(sectionName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'questions':
                this.loadQuestions();
                break;
        }
    }

    async loadDashboard() {
        try {
            const response = await fetch('/api/questions/stats/overview', {
                headers: window.auth.getAuthHeaders()
            });
            const stats = await response.json();

            // Update dashboard cards
            document.getElementById('totalQuestions').textContent = stats.totalQuestions;
            document.getElementById('totalSubjects').textContent = stats.bySubject.length;
            document.getElementById('programmingQuestions').textContent = 
                stats.byType.find(t => t._id === 'programming')?.count || 0;
            document.getElementById('recentActivity').textContent = 
                Math.floor(Math.random() * 10) + 1; // Mock data

            // Create charts
            this.createTypeChart(stats.byType);
            this.createDifficultyChart(stats.byDifficulty);

        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showMessage('Error loading dashboard data', 'error');
        }
    }

    createTypeChart(data) {
        const ctx = document.getElementById('typeChart');
        if (this.charts.typeChart) {
            this.charts.typeChart.destroy();
        }

        this.charts.typeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item._id.replace('_', ' ').toUpperCase()),
                datasets: [{
                    data: data.map(item => item.count),
                    backgroundColor: [
                        '#0d6efd',
                        '#198754',
                        '#ffc107',
                        '#dc3545',
                        '#0dcaf0'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createDifficultyChart(data) {
        const ctx = document.getElementById('difficultyChart');
        if (this.charts.difficultyChart) {
            this.charts.difficultyChart.destroy();
        }

        this.charts.difficultyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item._id.toUpperCase()),
                datasets: [{
                    label: 'Questions',
                    data: data.map(item => item.count),
                    backgroundColor: [
                        '#198754',
                        '#ffc107',
                        '#dc3545'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async loadQuestions(page = 1) {
        try {
            const params = new URLSearchParams({
                page: page,
                limit: this.itemsPerPage,
                ...this.currentFilters
            });

            console.log('Loading questions with params:', params.toString());
            const response = await fetch(`/api/questions?${params}`, {
                headers: window.auth.getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Questions data received:', data);

            this.displayQuestions(data.questions);
            this.createPagination(data.currentPage, data.totalPages);
            this.currentPage = page;

        } catch (error) {
            console.error('Error loading questions:', error);
            this.showMessage(`Error loading questions: ${error.message}`, 'error');
            
            // 显示空状态
            const tbody = document.getElementById('questionsTableBody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <br>No questions found. 
                        <br><small>Try adding some questions or check your database connection.</small>
                    </td>
                </tr>
            `;
        }
    }

    displayQuestions(questions) {
        const tbody = document.getElementById('questionsTableBody');
        tbody.innerHTML = '';

        questions.forEach(question => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${question.title}</td>
                <td>${question.subject}</td>
                <td><span class="badge bg-primary">${question.type.replace('_', ' ')}</span></td>
                <td><span class="badge bg-${this.getDifficultyColor(question.difficulty)}">${question.difficulty}</span></td>
                <td>${new Date(question.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="app.viewQuestion('${question._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="app.editQuestion('${question._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info me-1" onclick="app.addAnswer('${question._id}')">
                        <i class="fas fa-lightbulb"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteQuestion('${question._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getDifficultyColor(difficulty) {
        switch(difficulty) {
            case 'easy': return 'success';
            case 'medium': return 'warning';
            case 'hard': return 'danger';
            default: return 'secondary';
        }
    }

    createPagination(currentPage, totalPages) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" onclick="app.loadQuestions(${currentPage - 1})">Previous</a>`;
        pagination.appendChild(prevLi);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                const li = document.createElement('li');
                li.className = `page-item ${i === currentPage ? 'active' : ''}`;
                li.innerHTML = `<a class="page-link" href="#" onclick="app.loadQuestions(${i})">${i}</a>`;
                pagination.appendChild(li);
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                const li = document.createElement('li');
                li.className = 'page-item disabled';
                li.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(li);
            }
        }

        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" onclick="app.loadQuestions(${currentPage + 1})">Next</a>`;
        pagination.appendChild(nextLi);
    }

    async loadSubjects() {
        try {
            const response = await fetch('/api/questions/subjects/list', {
                headers: window.auth.getAuthHeaders()
            });
            const subjects = await response.json();

            const subjectFilters = ['subjectFilter', 'exportSubjectFilter'];
            subjectFilters.forEach(filterId => {
                const select = document.getElementById(filterId);
                select.innerHTML = '<option value="">All Subjects</option>';
                subjects.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject;
                    option.textContent = subject;
                    select.appendChild(option);
                });
            });

        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    }

    handleSearch(value) {
        this.currentFilters.search = value;
        this.loadQuestions(1);
    }

    applyFilters() {
        this.currentFilters.subject = document.getElementById('subjectFilter').value;
        this.currentFilters.type = document.getElementById('typeFilter').value;
        this.currentFilters.difficulty = document.getElementById('difficultyFilter').value;
        this.loadQuestions(1);
    }

    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('subjectFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('difficultyFilter').value = '';
        this.currentFilters = {};
        this.loadQuestions(1);
    }

    async saveQuestion() {
        try {
            const formData = this.getQuestionFormData();
            console.log('Saving question data:', formData);

            const questionId = document.getElementById('questionId').value;
            const url = questionId ? `/api/questions/${questionId}` : '/api/questions';
            const method = questionId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: window.auth.getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const savedQuestion = await response.json();
            console.log('Question saved successfully:', savedQuestion);

            this.showMessage('Question saved successfully!', 'success');
            this.closeQuestionModal();
            this.loadQuestions(this.currentPage);

        } catch (error) {
            console.error('Error saving question:', error);
            this.showMessage(`Error saving question: ${error.message}`, 'error');
        }
    }

    getQuestionFormData() {
        const type = document.getElementById('questionType').value;
        const options = [];
        
        // 处理选项（仅用于multiple_choice类型）
        if (type === 'multiple_choice') {
            document.querySelectorAll('.option-text').forEach((input, index) => {
                if (input.value.trim()) {
                    options.push({
                        text: input.value.trim(),
                        isCorrect: document.querySelectorAll('input[name="correctOption"]')[index]?.checked || false
                    });
                }
            });
        }

        const formData = {
            _id: document.getElementById('questionId').value || undefined,
            title: document.getElementById('questionTitle').value,
            content: document.getElementById('questionContent').value,
            type: type,
            subject: document.getElementById('questionSubject').value,
            difficulty: document.getElementById('questionDifficulty').value,
            programmingLanguage: document.getElementById('questionProgrammingLanguage').value,
            tags: document.getElementById('questionTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        // 根据题目类型添加特定字段
        switch (type) {
            case 'multiple_choice':
                formData.options = options;
                formData.correctAnswer = options.find(opt => opt.isCorrect)?.text || '';
                break;
            case 'true_false':
                formData.correctAnswer = document.getElementById('trueFalseAnswer').value === 'true';
                break;
            case 'short_answer':
                formData.correctAnswer = document.getElementById('shortAnswerText').value;
                break;
            case 'programming':
                formData.testCases = this.getTestCases();
                break;
            case 'essay':
                // 论文题目不需要额外字段
                break;
        }

        return formData;
    }

    addOption() {
        const optionsList = document.getElementById('optionsList');
        const optionItem = document.createElement('div');
        optionItem.className = 'option-item mb-2';
        optionItem.innerHTML = `
            <div class="input-group">
                <input type="text" class="form-control option-text" placeholder="Option text">
                <div class="input-group-text">
                    <input type="radio" name="correctOption" class="form-check-input">
                </div>
                <button type="button" class="btn btn-outline-danger remove-option">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        optionsList.appendChild(optionItem);

        // Add event listener to remove button
        optionItem.querySelector('.remove-option').addEventListener('click', () => {
            optionItem.remove();
        });
    }

    handleQuestionTypeChange() {
        const type = document.getElementById('questionType').value;
        const optionsContainer = document.getElementById('optionsContainer');
        const trueFalseContainer = document.getElementById('trueFalseContainer');
        const shortAnswerContainer = document.getElementById('shortAnswerContainer');
        const programmingLanguageField = document.getElementById('questionProgrammingLanguage').parentElement.parentElement;
        
        // 隐藏所有特定字段
        optionsContainer.style.display = 'none';
        trueFalseContainer.style.display = 'none';
        shortAnswerContainer.style.display = 'none';
        
        // 根据类型显示相应字段
        switch (type) {
            case 'multiple_choice':
                optionsContainer.style.display = 'block';
                programmingLanguageField.style.display = 'none';
                break;
            case 'true_false':
                trueFalseContainer.style.display = 'block';
                programmingLanguageField.style.display = 'none';
                break;
            case 'short_answer':
                shortAnswerContainer.style.display = 'block';
                programmingLanguageField.style.display = 'none';
                break;
            case 'programming':
                programmingLanguageField.style.display = 'block';
                break;
            case 'essay':
                programmingLanguageField.style.display = 'none';
                break;
        }
    }

    async editQuestion(id) {
        try {
            const response = await fetch(`/api/questions/${id}`, {
                headers: window.auth.getAuthHeaders()
            });
            const question = await response.json();

            document.getElementById('questionId').value = question._id;
            document.getElementById('questionTitle').value = question.title;
            document.getElementById('questionContent').value = question.content;
            document.getElementById('questionType').value = question.type;
            document.getElementById('questionSubject').value = question.subject;
            document.getElementById('questionDifficulty').value = question.difficulty;
            document.getElementById('questionProgrammingLanguage').value = question.programmingLanguage;
            document.getElementById('questionTags').value = question.tags.join(', ');

            // Clear existing options
            document.getElementById('optionsList').innerHTML = '';
            
            // Add options
            question.options.forEach(option => {
                this.addOption();
                const lastOption = document.querySelector('.option-item:last-child');
                lastOption.querySelector('.option-text').value = option.text;
                if (option.isCorrect) {
                    lastOption.querySelector('input[name="correctOption"]').checked = true;
                }
            });

            document.getElementById('questionModalTitle').textContent = 'Edit Question';
            new bootstrap.Modal(document.getElementById('questionModal')).show();

        } catch (error) {
            console.error('Error loading question:', error);
            this.showMessage('Error loading question', 'error');
        }
    }

    async deleteQuestion(id) {
        if (confirm('Are you sure you want to delete this question?')) {
            try {
                const response = await fetch(`/api/questions/${id}`, {
                    method: 'DELETE',
                    headers: window.auth.getAuthHeaders()
                });

                if (response.ok) {
                    this.showMessage('Question deleted successfully!', 'success');
                    this.loadQuestions(this.currentPage);
                } else {
                    const error = await response.json();
                    this.showMessage(error.error || 'Error deleting question', 'error');
                }

            } catch (error) {
                console.error('Error deleting question:', error);
                this.showMessage('Error deleting question', 'error');
            }
        }
    }

    closeQuestionModal() {
        document.getElementById('questionForm').reset();
        document.getElementById('questionId').value = '';
        document.getElementById('questionModalTitle').textContent = 'Add New Question';
        document.getElementById('optionsList').innerHTML = '';
        this.addOption(); // Add one default option
        bootstrap.Modal.getInstance(document.getElementById('questionModal')).hide();
    }

    async handleImport(event) {
        event.preventDefault();
        
        const formData = new FormData();
        const fileInput = document.getElementById('importFile');
        
        if (!fileInput.files[0]) {
            this.showMessage('Please select a file to import', 'error');
            return;
        }

        formData.append('file', fileInput.files[0]);

        try {
            const response = await fetch('/api/import-export/import', {
                method: 'POST',
                headers: {
                    'Authorization': window.auth.getAuthHeaders().Authorization
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage(`Successfully imported ${result.importedCount} questions!`, 'success');
                document.getElementById('importForm').reset();
                this.loadQuestions(1);
                this.loadDashboard();
            } else {
                this.showMessage(result.error || 'Error importing file', 'error');
            }

        } catch (error) {
            console.error('Error importing file:', error);
            this.showMessage('Error importing file', 'error');
        }
    }

    async handleExport(event) {
        event.preventDefault();

        const format = document.getElementById('exportFormat').value;
        const filters = {
            subject: document.getElementById('exportSubjectFilter').value,
            type: document.getElementById('exportTypeFilter').value,
            difficulty: document.getElementById('exportDifficultyFilter').value
        };

        try {
            const response = await fetch('/api/import-export/export', {
                method: 'POST',
                headers: window.auth.getAuthHeaders(),
                body: JSON.stringify({ format, filters })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `questions_export.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                this.showMessage('Export completed successfully!', 'success');
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'Error exporting questions', 'error');
            }

        } catch (error) {
            console.error('Error exporting questions:', error);
            this.showMessage('Error exporting questions', 'error');
        }
    }

    async validateCode() {
        const code = document.getElementById('codeEditor').value;
        const language = document.getElementById('programmingLanguage').value;

        if (!code.trim()) {
            this.showMessage('Please enter some code to validate', 'error');
            return;
        }

        try {
            const response = await fetch('/api/code-test/validate', {
                method: 'POST',
                headers: window.auth.getAuthHeaders(),
                body: JSON.stringify({ language, code })
            });

            const result = await response.json();

            if (result.valid) {
                this.showMessage('Code syntax is valid!', 'success');
            } else {
                this.showMessage(`Syntax error: ${result.errors.join(', ')}`, 'error');
            }

        } catch (error) {
            console.error('Error validating code:', error);
            this.showMessage('Error validating code', 'error');
        }
    }

    async runTests() {
        const code = document.getElementById('codeEditor').value;
        const language = document.getElementById('programmingLanguage').value;
        const testCases = this.getTestCases();

        if (!code.trim()) {
            this.showMessage('Please enter some code to test', 'error');
            return;
        }

        if (testCases.length === 0) {
            this.showMessage('Please add at least one test case', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/code-test/${language}`, {
                method: 'POST',
                headers: window.auth.getAuthHeaders(),
                body: JSON.stringify({ code, testCases })
            });

            const result = await response.json();

            if (result.success) {
                this.displayTestResults(result);
            } else {
                this.showMessage(result.error || 'Error running tests', 'error');
            }

        } catch (error) {
            console.error('Error running tests:', error);
            this.showMessage('Error running tests', 'error');
        }
    }

    getTestCases() {
        const testCases = [];
        document.querySelectorAll('.test-case').forEach((testCase, index) => {
            const input = testCase.querySelector('.test-input').value;
            const expected = testCase.querySelector('.test-expected').value;
            
            if (input.trim() && expected.trim()) {
                testCases.push({
                    input: input.trim(),
                    expectedOutput: expected.trim(),
                    description: `Test case ${index + 1}`
                });
            }
        });
        return testCases;
    }

    displayTestResults(result) {
        const resultsContainer = document.getElementById('testResults');
        
        let html = `
            <div class="mb-3">
                <h6>Test Summary</h6>
                <p>Total: ${result.summary.total} | Passed: ${result.summary.passed} | Failed: ${result.summary.failed}</p>
            </div>
        `;

        result.testResults.forEach((test, index) => {
            const statusClass = test.passed ? 'success' : 'danger';
            const statusIcon = test.passed ? 'check' : 'times';
            
            html += `
                <div class="test-result mb-2 p-2 border rounded">
                    <div class="d-flex justify-content-between align-items-center">
                        <strong>Test Case ${index + 1}</strong>
                        <span class="badge bg-${statusClass}">
                            <i class="fas fa-${statusIcon} me-1"></i>${test.passed ? 'PASS' : 'FAIL'}
                        </span>
                    </div>
                    <div class="mt-2">
                        <small><strong>Input:</strong> ${test.input}</small><br>
                        <small><strong>Expected:</strong> ${test.expectedOutput}</small><br>
                        <small><strong>Actual:</strong> ${test.actualOutput}</small>
                        ${test.error ? `<br><small class="text-danger"><strong>Error:</strong> ${test.error}</small>` : ''}
                    </div>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
    }

    addTestCase() {
        const container = document.getElementById('testCasesContainer');
        const testCaseCount = container.children.length + 1;
        
        const testCase = document.createElement('div');
        testCase.className = 'test-case mb-3';
        testCase.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6>Test Case ${testCaseCount}</h6>
                <button type="button" class="btn btn-outline-danger btn-sm remove-test-case">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="mb-2">
                <label class="form-label">Input</label>
                <input type="text" class="form-control test-input" placeholder="Input value">
            </div>
            <div class="mb-2">
                <label class="form-label">Expected Output</label>
                <input type="text" class="form-control test-expected" placeholder="Expected output">
            </div>
        `;
        
        container.appendChild(testCase);

        // Add event listener to remove button
        testCase.querySelector('.remove-test-case').addEventListener('click', () => {
            testCase.remove();
            this.updateTestCaseNumbers();
        });
    }

    updateTestCaseNumbers() {
        document.querySelectorAll('.test-case').forEach((testCase, index) => {
            testCase.querySelector('h6').textContent = `Test Case ${index + 1}`;
        });
    }

    showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Remove existing alerts
        document.querySelectorAll('.alert').forEach(alert => alert.remove());

        // Add new alert
        document.querySelector('.container-fluid').insertBefore(alertDiv, document.querySelector('.container-fluid').firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Answer management methods
    async addAnswer(questionId) {
        try {
            const response = await fetch(`/api/questions/${questionId}`, {
                headers: window.auth.getAuthHeaders()
            });
            const question = await response.json();

            document.getElementById('answerQuestionId').value = question._id;
            document.getElementById('answerQuestionTitle').value = question.title;
            
            // 如果已有答案，填充现有数据
            if (question.answer) {
                document.getElementById('answerExplanation').value = question.answer.explanation || '';
                document.getElementById('answerDetailedSolution').value = question.answer.detailedSolution || '';
                document.getElementById('answerKeyPoints').value = question.answer.keyPoints ? question.answer.keyPoints.join(', ') : '';
                document.getElementById('answerReferences').value = question.answer.references ? question.answer.references.join(', ') : '';
                document.getElementById('answerDifficulty').value = question.answer.difficulty || 'medium';
                document.getElementById('answerModalTitle').textContent = 'Edit Answer';
            } else {
                // 清空表单
                document.getElementById('answerForm').reset();
                document.getElementById('answerModalTitle').textContent = 'Add Answer';
            }

            new bootstrap.Modal(document.getElementById('answerModal')).show();

        } catch (error) {
            console.error('Error loading question for answer:', error);
            this.showMessage('Error loading question', 'error');
        }
    }

    async saveAnswer() {
        try {
            const questionId = document.getElementById('answerQuestionId').value;
            const answerData = {
                answer: {
                    explanation: document.getElementById('answerExplanation').value,
                    detailedSolution: document.getElementById('answerDetailedSolution').value,
                    keyPoints: document.getElementById('answerKeyPoints').value.split(',').map(point => point.trim()).filter(point => point),
                    references: document.getElementById('answerReferences').value.split(',').map(ref => ref.trim()).filter(ref => ref),
                    difficulty: document.getElementById('answerDifficulty').value
                }
            };

            console.log('Saving answer data:', answerData);

            const response = await fetch(`/api/questions/${questionId}`, {
                method: 'PUT',
                headers: window.auth.getAuthHeaders(),
                body: JSON.stringify(answerData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const savedQuestion = await response.json();
            console.log('Answer saved successfully:', savedQuestion);

            this.showMessage('Answer saved successfully!', 'success');
            this.closeAnswerModal();

        } catch (error) {
            console.error('Error saving answer:', error);
            this.showMessage(`Error saving answer: ${error.message}`, 'error');
        }
    }

    closeAnswerModal() {
        document.getElementById('answerForm').reset();
        document.getElementById('answerQuestionId').value = '';
        document.getElementById('answerModalTitle').textContent = 'Add Answer';
        bootstrap.Modal.getInstance(document.getElementById('answerModal')).hide();
    }

    // View question methods
    async viewQuestion(questionId) {
        try {
            const response = await fetch(`/api/questions/${questionId}`, {
                headers: window.auth.getAuthHeaders()
            });
            const question = await response.json();

            // 填充问题信息
            document.getElementById('viewQuestionTitle').textContent = question.title;
            document.getElementById('viewQuestionSubject').textContent = question.subject;
            document.getElementById('viewQuestionType').textContent = question.type.replace('_', ' ').toUpperCase();
            document.getElementById('viewQuestionDifficulty').textContent = question.difficulty.toUpperCase();
            document.getElementById('viewQuestionContent').textContent = question.content;
            document.getElementById('viewQuestionTags').textContent = question.tags.join(', ');
            document.getElementById('viewQuestionCreated').textContent = new Date(question.createdAt).toLocaleString();

            // 处理选项（如果是选择题）
            const optionsContainer = document.getElementById('viewQuestionOptions');
            const optionsList = document.getElementById('viewQuestionOptionsList');
            if (question.type === 'multiple_choice' && question.options && question.options.length > 0) {
                optionsContainer.style.display = 'block';
                optionsList.innerHTML = '';
                question.options.forEach((option, index) => {
                    const li = document.createElement('li');
                    li.innerHTML = `${option.text} ${option.isCorrect ? '<span class="badge bg-success ms-2">Correct</span>' : ''}`;
                    optionsList.appendChild(li);
                });
            } else {
                optionsContainer.style.display = 'none';
            }

            // 处理正确答案
            const correctAnswerContainer = document.getElementById('viewQuestionCorrectAnswer');
            const correctAnswerText = document.getElementById('viewQuestionCorrectAnswerText');
            if (question.correctAnswer) {
                correctAnswerContainer.style.display = 'block';
                correctAnswerText.textContent = question.correctAnswer;
            } else {
                correctAnswerContainer.style.display = 'none';
            }

            // 处理答案信息
            const noAnswerDiv = document.getElementById('viewQuestionNoAnswer');
            const answerDetailsDiv = document.getElementById('viewQuestionAnswerDetails');
            
            if (question.answer && question.answer.explanation) {
                noAnswerDiv.style.display = 'none';
                answerDetailsDiv.style.display = 'block';
                
                document.getElementById('viewQuestionExplanation').textContent = question.answer.explanation;
                document.getElementById('viewQuestionDetailedSolution').textContent = question.answer.detailedSolution || 'No detailed solution provided.';
                document.getElementById('viewQuestionAnswerDifficulty').textContent = question.answer.difficulty.toUpperCase();
                
                // 处理关键点
                const keyPointsList = document.getElementById('viewQuestionKeyPoints');
                keyPointsList.innerHTML = '';
                if (question.answer.keyPoints && question.answer.keyPoints.length > 0) {
                    question.answer.keyPoints.forEach(point => {
                        const li = document.createElement('li');
                        li.textContent = point;
                        keyPointsList.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = 'No key points specified.';
                    keyPointsList.appendChild(li);
                }
                
                // 处理参考资料
                const referencesList = document.getElementById('viewQuestionReferences');
                referencesList.innerHTML = '';
                if (question.answer.references && question.answer.references.length > 0) {
                    question.answer.references.forEach(ref => {
                        const li = document.createElement('li');
                        li.textContent = ref;
                        referencesList.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = 'No references specified.';
                    referencesList.appendChild(li);
                }
            } else {
                noAnswerDiv.style.display = 'block';
                answerDetailsDiv.style.display = 'none';
            }

            // 存储当前问题ID用于添加答案
            document.getElementById('viewQuestionModal').dataset.questionId = questionId;

            new bootstrap.Modal(document.getElementById('viewQuestionModal')).show();

        } catch (error) {
            console.error('Error loading question for view:', error);
            this.showMessage('Error loading question details', 'error');
        }
    }

    viewQuestionAddAnswer() {
        const questionId = document.getElementById('viewQuestionModal').dataset.questionId;
        bootstrap.Modal.getInstance(document.getElementById('viewQuestionModal')).hide();
        this.addAnswer(questionId);
    }
}

// Initialize the application
const app = new QuestionBankApp();

// Add event listener for modal close
document.getElementById('questionModal').addEventListener('hidden.bs.modal', () => {
    app.closeQuestionModal();
});

// Add event listener for answer modal close
document.getElementById('answerModal').addEventListener('hidden.bs.modal', () => {
    app.closeAnswerModal();
}); 