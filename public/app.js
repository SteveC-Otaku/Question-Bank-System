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
            console.log('User not authenticated, redirecting to login');
            window.location.href = 'login.html';
            return;
        }

        console.log('User authenticated:', window.auth.getCurrentUser());
        
        // Validate if token is still valid
        this.validateToken();
        
        // Display user information
        this.displayUserInfo();
    }

    async validateToken() {
        try {
            const response = await fetch('/api/auth/me', {
                headers: window.auth.getAuthHeaders()
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Token invalid or expired');
                    this.showMessage('Session expired. Please log in again.', 'error');
                    window.auth.handleLogout();
                    return false;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Token validation successful:', data);
            return true;
            
        } catch (error) {
            console.error('Token validation failed:', error);
            this.showMessage('Authentication failed. Please log in again.', 'error');
            window.auth.handleLogout();
            return false;
        }
    }

    displayUserInfo() {
        const user = window.auth.getCurrentUser();
        if (user) {
            const displayName = document.getElementById('userDisplayName');
            if (displayName) {
                displayName.textContent = user.getFullName ? user.getFullName() : `${user.firstName} ${user.lastName}`;
            }
            
            // Update dashboard user info
            this.updateDashboardUserInfo(user);
            
            // Update UI based on user role
            this.updateUIForUserRole(user.role);
        }
    }

    updateDashboardUserInfo(user) {
        // Update dashboard user information
        const userName = document.getElementById('dashboardUserName');
        const userEmail = document.getElementById('dashboardUserEmail');
        const userRole = document.getElementById('dashboardUserRole');
        
        if (userName) {
            userName.textContent = user.getFullName ? user.getFullName() : `${user.firstName} ${user.lastName}`;
        }
        
        if (userEmail) {
            userEmail.textContent = user.email || 'No email provided';
        }
        
        if (userRole) {
            userRole.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown';
            userRole.className = `badge fs-6 role-badge-large ${user.role || 'unknown'}`;
        }
        
        // Update permissions overview
        this.displayPermissionsOverview(user.role);
    }

    displayPermissionsOverview(role) {
        const permissionsContainer = document.getElementById('permissionsOverview');
        if (!permissionsContainer) return;

        const permissions = this.getRolePermissions(role);
        
        let html = `
            <div class="permission-grid">
                <div class="permission-section">
                    <h6><i class="fas fa-eye me-2"></i>Viewing & Access</h6>
        `;
        
        // Viewing permissions
        permissions.viewing.forEach(permission => {
            html += `
                <div class="permission-item ${permission.allowed ? 'allowed' : 'restricted'}">
                    <i class="fas fa-${permission.allowed ? 'check' : 'times'}"></i>
                    <span>${permission.name}</span>
                </div>
            `;
        });
        
        html += `
                </div>
                <div class="permission-section">
                    <h6><i class="fas fa-edit me-2"></i>Content Management</h6>
        `;
        
        // Content management permissions
        permissions.content.forEach(permission => {
            html += `
                <div class="permission-item ${permission.allowed ? 'allowed' : 'restricted'}">
                    <i class="fas fa-${permission.allowed ? 'check' : 'times'}"></i>
                    <span>${permission.name}</span>
                </div>
            `;
        });
        
        html += `
                </div>
                <div class="permission-section">
                    <h6><i class="fas fa-cogs me-2"></i>System Features</h6>
        `;
        
        // System features permissions
        permissions.system.forEach(permission => {
            html += `
                <div class="permission-item ${permission.allowed ? 'allowed' : 'restricted'}">
                    <i class="fas fa-${permission.allowed ? 'check' : 'times'}"></i>
                    <span>${permission.name}</span>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        permissionsContainer.innerHTML = html;
    }

    getRolePermissions(role) {
        const allPermissions = {
            viewing: [
                { name: 'View Questions', allowed: true },
                { name: 'View Question Answers', allowed: true },
                { name: 'Search & Filter Questions', allowed: true },
                { name: 'View Dashboard Statistics', allowed: role === 'teacher' || role === 'admin' }
            ],
            content: [
                { name: 'Create New Questions', allowed: role === 'teacher' || role === 'admin' },
                { name: 'Edit Existing Questions', allowed: role === 'teacher' || role === 'admin' },
                { name: 'Delete Questions', allowed: role === 'admin' },
                { name: 'Add/Edit Question Answers', allowed: role === 'teacher' || role === 'admin' }
            ],
            system: [
                { name: 'Import Questions from Files', allowed: role === 'teacher' || role === 'admin' },
                { name: 'Export Questions to Files', allowed: role === 'teacher' || role === 'admin' },
                { name: 'Code Testing & Validation', allowed: true },
                { name: 'User Account Management', allowed: role === 'admin', description: 'Create, edit, and manage user accounts' }
            ]
        };
        
        return allPermissions;
    }

    updateUIForUserRole(role) {
        // Hide/show navigation items based on role
        const dashboardNav = document.querySelector('[data-section="dashboard"]');
        const questionsNav = document.querySelector('[data-section="questions"]');
        const importExportNav = document.querySelector('[data-section="import-export"]');
        const codeTestNav = document.querySelector('[data-section="code-test"]');

        // All users can access questions and code testing
        if (questionsNav) questionsNav.style.display = 'block';
        if (codeTestNav) codeTestNav.style.display = 'block';

        // Only teachers and admins can access dashboard and import/export
        if (role === 'student') {
            if (dashboardNav) dashboardNav.style.display = 'none';
            if (importExportNav) importExportNav.style.display = 'none';
            
            // Show student-specific UI elements
            this.showStudentUI();
        } else {
            if (dashboardNav) dashboardNav.style.display = 'block';
            if (importExportNav) importExportNav.style.display = 'block';
            
            // Hide student-specific UI elements
            this.hideStudentUI();
        }

        // Only admins can access user management
        const userManagementNav = document.getElementById('userManagementNav');
        if (userManagementNav) {
            if (role === 'admin') {
                userManagementNav.style.display = 'block';
            } else {
                userManagementNav.style.display = 'none';
            }
        }

        // Update Add Question button visibility
        const addQuestionBtn = document.getElementById('addQuestionBtn');
        if (addQuestionBtn) {
            if (role === 'student') {
                addQuestionBtn.style.display = 'none';
            } else {
                addQuestionBtn.style.display = 'block';
            }
        }
    }

    showStudentUI() {
        // Show student account info
        const studentAccountInfo = document.getElementById('studentAccountInfo');
        const studentPermissionsOverview = document.getElementById('studentPermissionsOverview');
        
        if (studentAccountInfo) studentAccountInfo.style.display = 'block';
        if (studentPermissionsOverview) studentPermissionsOverview.style.display = 'block';
        
        // Update student account info
        this.updateStudentAccountInfo();
        
        // Display student permissions
        this.displayStudentPermissions();
    }

    hideStudentUI() {
        // Hide student account info
        const studentAccountInfo = document.getElementById('studentAccountInfo');
        const studentPermissionsOverview = document.getElementById('studentPermissionsOverview');
        
        if (studentAccountInfo) studentAccountInfo.style.display = 'none';
        if (studentPermissionsOverview) studentPermissionsOverview.style.display = 'none';
    }

    updateStudentAccountInfo() {
        const user = window.auth.getCurrentUser();
        if (!user) return;

        const userName = document.getElementById('studentUserName');
        const userEmail = document.getElementById('studentUserEmail');
        const userRole = document.getElementById('studentUserRole');
        
        if (userName) {
            userName.textContent = user.getFullName ? user.getFullName() : `${user.firstName} ${user.lastName}`;
        }
        
        if (userEmail) {
            userEmail.textContent = user.email || 'No email provided';
        }
        
        if (userRole) {
            userRole.textContent = 'Student';
            userRole.className = 'badge fs-6 role-badge-large student';
        }
    }

    displayStudentPermissions() {
        const permissionsContainer = document.getElementById('studentPermissionsContent');
        if (!permissionsContainer) return;

        const permissions = [
            {
                icon: 'fas fa-eye',
                title: 'View Questions',
                description: 'Browse and read all available questions in the system'
            },
            {
                icon: 'fas fa-search',
                title: 'Search & Filter',
                description: 'Find specific questions using keywords, subjects, or difficulty levels'
            },
            {
                icon: 'fas fa-lightbulb',
                title: 'View Answers',
                description: 'Access detailed explanations and solutions for questions'
            },
            {
                icon: 'fas fa-code',
                title: 'Code Testing',
                description: 'Test your programming solutions with our built-in code editor'
            },
            {
                icon: 'fas fa-user',
                title: 'Profile Management',
                description: 'Update your personal information and change your password'
            }
        ];

        let html = `
            <div class="row">
                <div class="col-12">
                    <p class="text-muted mb-4">As a student, you have access to the following features:</p>
                </div>
            </div>
            <div class="row">
        `;

        permissions.forEach(permission => {
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="permission-card">
                        <div class="d-flex align-items-start">
                            <div class="permission-icon allowed me-3">
                                <i class="${permission.icon}"></i>
                            </div>
                            <div class="permission-content">
                                <h6>${permission.title}</h6>
                                <p>${permission.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            <div class="row mt-4">
                <div class="col-12">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Need more access?</strong> Contact your instructor or administrator if you need additional permissions for your studies.
                    </div>
                </div>
            </div>
        `;

        permissionsContainer.innerHTML = html;
    }

    getRoleColor(role) {
        switch (role) {
            case 'admin': return 'danger';
            case 'teacher': return 'primary';
            case 'student': return 'success';
            default: return 'secondary';
        }
    }

    init() {
        this.setupEventListeners();
        
        // Check user role and load appropriate default section
        const user = window.auth.getCurrentUser();
        if (user && user.role === 'student') {
            // Students start on Questions page
            this.showSection('questions');
        } else {
            // Teachers and admins start on Dashboard
            this.loadDashboard();
        }
        
        this.loadQuestions();
        this.loadSubjects();
        
        // Load users if admin
        if (user && user.role === 'admin') {
            this.loadUsers();
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.dataset.section);
            });
        });

        // Question management - Add null checks
        const saveQuestionBtn = document.getElementById('saveQuestion');
        if (saveQuestionBtn) saveQuestionBtn.addEventListener('click', () => this.saveQuestion());
        
        const addOptionBtn = document.getElementById('addOption');
        if (addOptionBtn) addOptionBtn.addEventListener('click', () => this.addOption());
        
        const questionTypeSelect = document.getElementById('questionType');
        if (questionTypeSelect) questionTypeSelect.addEventListener('change', () => this.handleQuestionTypeChange());

        // Answer management - Add null checks
        const saveAnswerBtn = document.getElementById('saveAnswer');
        if (saveAnswerBtn) saveAnswerBtn.addEventListener('click', () => this.saveAnswer());
        
        const viewQuestionAddAnswerBtn = document.getElementById('viewQuestionAddAnswer');
        if (viewQuestionAddAnswerBtn) viewQuestionAddAnswerBtn.addEventListener('click', () => this.viewQuestionAddAnswer());

        // Profile management - Add null checks
        const userProfileBtn = document.getElementById('userProfile');
        if (userProfileBtn) userProfileBtn.addEventListener('click', () => this.showProfile());
        
        const saveProfileBtn = document.getElementById('saveProfile');
        if (saveProfileBtn) saveProfileBtn.addEventListener('click', () => this.saveProfile());
        
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) changePasswordForm.addEventListener('submit', (e) => this.changePassword(e));

        // User management (Admin only) - Optional chaining already used
        document.getElementById('addUserBtn')?.addEventListener('click', () => this.showAddUserModal());
        document.getElementById('saveUser')?.addEventListener('click', () => this.saveUser());
        document.getElementById('refreshUsersBtn')?.addEventListener('click', () => this.loadUsers());
        document.getElementById('userSearchInput')?.addEventListener('input', (e) => this.searchUsers(e.target.value));

        // Filters - Add null checks
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        const subjectFilter = document.getElementById('subjectFilter');
        if (subjectFilter) subjectFilter.addEventListener('change', () => this.applyFilters());
        
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) typeFilter.addEventListener('change', () => this.applyFilters());
        
        const difficultyFilter = document.getElementById('difficultyFilter');
        if (difficultyFilter) difficultyFilter.addEventListener('change', () => this.applyFilters());
        
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => this.clearFilters());

        // Import/Export - Add null checks
        const importForm = document.getElementById('importForm');
        if (importForm) importForm.addEventListener('submit', (e) => this.handleImport(e));
        
        const exportForm = document.getElementById('exportForm');
        if (exportForm) exportForm.addEventListener('submit', (e) => this.handleExport(e));

        // Code testing functionality
        const runTestsBtn = document.getElementById('runTests');
        if (runTestsBtn) runTestsBtn.addEventListener('click', () => this.runCodeTests());
        
        const addTestCaseBtn = document.getElementById('addTestCase');
        if (addTestCaseBtn) addTestCaseBtn.addEventListener('click', () => this.addTestCase());
        
        const clearTestCasesBtn = document.getElementById('clearTestCases');
        if (clearTestCasesBtn) clearTestCasesBtn.addEventListener('click', () => this.clearAllTestCases());
        
        const programmingLanguageSelect = document.getElementById('programmingLanguage');
        if (programmingLanguageSelect) programmingLanguageSelect.addEventListener('change', () => this.handleLanguageChange());
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
            case 'user-management':
                this.loadUsers();
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
            // Check authentication status
            if (!window.auth || !window.auth.isAuthenticated()) {
                console.error('User not authenticated');
                this.showMessage('Please log in to access questions', 'error');
                window.location.href = 'login.html';
                return;
            }

            const params = new URLSearchParams({
                page: page,
                limit: this.itemsPerPage,
                ...this.currentFilters
            });

            console.log('Loading questions with params:', params.toString());
            console.log('Auth headers:', window.auth.getAuthHeaders());
            
            const response = await fetch(`/api/questions?${params}`, {
                headers: window.auth.getAuthHeaders()
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Authentication failed, redirecting to login');
                    this.showMessage('Session expired. Please log in again.', 'error');
                    window.auth.handleLogout();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Questions data received:', data);

            this.displayQuestions(data.questions);
            this.currentPage = parseInt(page);
            this.createPagination(this.currentPage, data.totalPages);

        } catch (error) {
            console.error('Error loading questions:', error);
            this.showMessage(`Error loading questions: ${error.message}`, 'error');
            
            // Show empty state
            const tbody = document.getElementById('questionsTableBody');
            if (tbody) {
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
    }

    displayQuestions(questions) {
        const tbody = document.getElementById('questionsTableBody');
        tbody.innerHTML = '';

        // Get current user role
        const currentUser = window.auth.getCurrentUser();
        const userRole = currentUser ? currentUser.role : 'student';

        questions.forEach(question => {
            const row = document.createElement('tr');
            
            // Generate action buttons based on user role
            let actionButtons = `
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="app.viewQuestion('${question._id}')" title="View Question">
                    <i class="fas fa-eye"></i>
                </button>
            `;

            // Teachers and admins can edit questions and add answers
            if (userRole === 'teacher' || userRole === 'admin') {
                actionButtons += `
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="app.editQuestion('${question._id}')" title="Edit Question">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info me-1" onclick="app.addAnswer('${question._id}')" title="Add/Edit Answer">
                        <i class="fas fa-lightbulb"></i>
                    </button>
                `;
            }

            // Only admins can delete questions
            if (userRole === 'admin') {
                actionButtons += `
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteQuestion('${question._id}')" title="Delete Question">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
            }

            row.innerHTML = `
                <td>${question.title}</td>
                <td>${question.subject}</td>
                <td><span class="badge bg-primary">${question.type.replace('_', ' ')}</span></td>
                <td><span class="badge bg-${this.getDifficultyColor(question.difficulty)}">${question.difficulty}</span></td>
                <td>${new Date(question.createdAt).toLocaleDateString()}</td>
                <td>${actionButtons}</td>
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
        
        console.log('Creating pagination with currentPage:', currentPage, 'totalPages:', totalPages);

        // Previous button
        const prevLi = document.createElement('li');
        const isFirstPage = currentPage === 1;
        console.log('isFirstPage:', isFirstPage);
        prevLi.className = `page-item ${isFirstPage ? 'disabled' : ''}`;
        
        if (isFirstPage) {
            // 第一页时显示禁用的Previous按钮
            prevLi.innerHTML = '<span class="page-link">Previous</span>';
        } else {
            // 非第一页时显示可点击的Previous按钮
            const prevLink = document.createElement('a');
            prevLink.className = 'page-link';
            prevLink.href = '#';
            prevLink.textContent = 'Previous';
            prevLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadQuestions(this.currentPage - 1);
            });
            prevLi.appendChild(prevLink);
        }
        pagination.appendChild(prevLi);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                const li = document.createElement('li');
                li.className = `page-item ${i === currentPage ? 'active' : ''}`;
                const link = document.createElement('a');
                link.className = 'page-link';
                link.href = '#';
                link.textContent = i.toString();
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.loadQuestions(i);
                });
                li.appendChild(link);
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
        const isLastPage = currentPage === totalPages;
        console.log('isLastPage:', isLastPage, 'currentPage:', currentPage, 'totalPages:', totalPages);
        nextLi.className = `page-item ${isLastPage ? 'disabled' : ''}`;
        
        if (isLastPage) {
            // 最后一页时显示禁用的Next按钮
            nextLi.innerHTML = '<span class="page-link">Next</span>';
        } else {
            // 非最后一页时显示可点击的Next按钮
            const nextLink = document.createElement('a');
            nextLink.className = 'page-link';
            nextLink.href = '#';
            nextLink.textContent = 'Next';
            nextLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadQuestions(this.currentPage + 1);
            });
            nextLi.appendChild(nextLink);
        }
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
        
        // Handle options (only for multiple_choice type)
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

        // Add specific fields based on question type
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
                // Essay questions do not need additional fields
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
        
        // Hide all specific fields
        optionsContainer.style.display = 'none';
        trueFalseContainer.style.display = 'none';
        shortAnswerContainer.style.display = 'none';
        
        // Show corresponding fields based on type
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

    async runCodeTests() {
        const code = document.getElementById('codeEditor').value;
        const language = document.getElementById('programmingLanguage').value;
        const testCases = this.getTestCases();

        // Validate input
        if (!code.trim()) {
            this.showMessage('Please enter some code to test', 'error');
            return;
        }

        if (testCases.length === 0) {
            this.showMessage('Please add at least one test case', 'error');
            return;
        }

        // Show loading state
        this.showLoadingState();

        try {
            console.log('Running code tests:', { language, code, testCases });
            
            const response = await fetch(`/api/code-test/${language}`, {
                method: 'POST',
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code, testCases })
            });

            const result = await response.json();
            console.log('Test result:', result);

            if (result.success) {
                this.displayTestResults(result);
            } else {
                this.showMessage(result.error || 'Error running tests', 'error');
                this.showEmptyState();
            }

        } catch (error) {
            console.error('Error running tests:', error);
            this.showMessage('Error running tests', 'error');
            this.showEmptyState();
        }
    }


    displayTestResults(result) {
        const resultsContainer = document.getElementById('testResults');
        
        // Calculate statistics
        const total = result.testResults.length;
        const passed = result.testResults.filter(test => test.passed).length;
        const failed = total - passed;
        const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
        
        let html = `
            <div class="test-summary mb-4">
                <div class="row text-center">
                    <div class="col-md-3">
                        <div class="h4 text-primary">${total}</div>
                        <div class="text-muted">Total Tests</div>
                    </div>
                    <div class="col-md-3">
                        <div class="h4 text-success">${passed}</div>
                        <div class="text-muted">Passed</div>
                    </div>
                    <div class="col-md-3">
                        <div class="h4 text-danger">${failed}</div>
                        <div class="text-muted">Failed</div>
                    </div>
                    <div class="col-md-3">
                        <div class="h4 ${successRate === 100 ? 'text-success' : successRate >= 50 ? 'text-warning' : 'text-danger'}">${successRate}%</div>
                        <div class="text-muted">Success Rate</div>
                    </div>
                </div>
            </div>
        `;

        // Display results for each test case
        result.testResults.forEach((test, index) => {
            const statusClass = test.passed ? 'success' : 'danger';
            const statusIcon = test.passed ? 'check-circle' : 'times-circle';
            const borderClass = test.passed ? 'border-success' : 'border-danger';
            
            html += `
                <div class="test-result mb-3 p-3 border ${borderClass} rounded">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="mb-0">Test Case ${index + 1}</h6>
                        <span class="badge bg-${statusClass} fs-6">
                            <i class="fas fa-${statusIcon} me-1"></i>${test.passed ? 'PASS' : 'FAIL'}
                        </span>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-2">
                                <strong class="text-primary">Input:</strong>
                                <div class="bg-light p-2 rounded mt-1">
                                    <code>${test.input.replace(/\n/g, '<br>')}</code>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-2">
                                <strong class="text-success">Expected Output:</strong>
                                <div class="bg-light p-2 rounded mt-1">
                                    <code>${test.expectedOutput}</code>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <div class="mb-2">
                                <strong class="text-info">Actual Output:</strong>
                                <div class="bg-light p-2 rounded mt-1">
                                    <code>${test.actualOutput || '(no output)'}</code>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${test.error ? `
                        <div class="alert alert-danger mt-2">
                            <strong>Error:</strong> ${test.error}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
    }

    addTestCase() {
        const container = document.getElementById('testCasesContainer');
        const testCaseCount = container.children.length + 1;
        
        const testCase = document.createElement('div');
        testCase.className = 'test-case mb-3 p-3 border rounded';
        testCase.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Test Case ${testCaseCount}</h6>
                <button type="button" class="btn btn-outline-danger btn-sm remove-test-case">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">Input</label>
                <textarea class="form-control test-input" rows="3" 
                          placeholder="Enter input values (one per line)&#10;&#10;Example:&#10;1&#10;2"></textarea>
                <small class="form-text text-muted">Enter each input value on a separate line</small>
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">Expected Output</label>
                <textarea class="form-control test-expected" rows="2" 
                          placeholder="Expected output&#10;&#10;Example:&#10;3"></textarea>
            </div>
        `;
        
        container.appendChild(testCase);

        // Add event listener to remove button
        testCase.querySelector('.remove-test-case').addEventListener('click', () => {
            testCase.remove();
            this.updateTestCaseNumbers();
        });
    }

    clearAllTestCases() {
        if (confirm('Are you sure you want to clear all test cases?')) {
            document.getElementById('testCasesContainer').innerHTML = '';
            this.addTestCase(); // Add one empty test case
            this.showMessage('All test cases cleared', 'info');
        }
    }

    showLoadingState() {
        const resultsContainer = document.getElementById('testResults');
        resultsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h5>Running Tests...</h5>
                <p class="text-muted">Please wait while your code is being executed</p>
            </div>
        `;
    }

    showEmptyState() {
        const resultsContainer = document.getElementById('testResults');
        resultsContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-play-circle fa-3x mb-3"></i>
                <h5>Ready to Test</h5>
                <p>Write your code, add test cases, and click "Run Code" to see the results</p>
            </div>
        `;
    }

    updateTestCaseNumbers() {
        document.querySelectorAll('.test-case').forEach((testCase, index) => {
            const title = testCase.querySelector('h6');
            if (title) {
                title.textContent = `Test Case ${index + 1}`;
            }
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
            
            // If answer exists, populate existing data
            if (question.answer) {
                document.getElementById('answerExplanation').value = question.answer.explanation || '';
                document.getElementById('answerDetailedSolution').value = question.answer.detailedSolution || '';
                document.getElementById('answerKeyPoints').value = question.answer.keyPoints ? question.answer.keyPoints.join(', ') : '';
                document.getElementById('answerReferences').value = question.answer.references ? question.answer.references.join(', ') : '';
                document.getElementById('answerDifficulty').value = question.answer.difficulty || 'medium';
                document.getElementById('answerModalTitle').textContent = 'Edit Answer';
            } else {
                // Clear form
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

            // Populate question information
            document.getElementById('viewQuestionTitle').textContent = question.title;
            document.getElementById('viewQuestionSubject').textContent = question.subject;
            document.getElementById('viewQuestionType').textContent = question.type.replace('_', ' ').toUpperCase();
            document.getElementById('viewQuestionDifficulty').textContent = question.difficulty.toUpperCase();
            document.getElementById('viewQuestionContent').textContent = question.content;
            document.getElementById('viewQuestionTags').textContent = question.tags.join(', ');
            document.getElementById('viewQuestionCreated').textContent = new Date(question.createdAt).toLocaleString();

            // Handle options (if multiple choice)
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

            // Handle correct answer
            const correctAnswerContainer = document.getElementById('viewQuestionCorrectAnswer');
            const correctAnswerText = document.getElementById('viewQuestionCorrectAnswerText');
            if (question.correctAnswer) {
                correctAnswerContainer.style.display = 'block';
                correctAnswerText.textContent = question.correctAnswer;
            } else {
                correctAnswerContainer.style.display = 'none';
            }

            // Handle answer information
            const noAnswerDiv = document.getElementById('viewQuestionNoAnswer');
            const answerDetailsDiv = document.getElementById('viewQuestionAnswerDetails');
            
            if (question.answer && question.answer.explanation) {
                noAnswerDiv.style.display = 'none';
                answerDetailsDiv.style.display = 'block';
                
                document.getElementById('viewQuestionExplanation').textContent = question.answer.explanation;
                document.getElementById('viewQuestionDetailedSolution').textContent = question.answer.detailedSolution || 'No detailed solution provided.';
                document.getElementById('viewQuestionAnswerDifficulty').textContent = question.answer.difficulty.toUpperCase();
                
                // Handle key points
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
                
                // Handle references
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

            // Store current question ID for adding answer
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

    // Enhanced code testing functionality
    loadCodeTemplate() {
        const language = document.getElementById('programmingLanguage').value;
        const inputFormat = document.getElementById('inputFormat').value;
        
        let template = '';
        
        if (language === 'python') {
            switch (inputFormat) {
                case 'comma':
                    template = `# Read comma-separated input
input_line = input().strip()
a, b = map(int, input_line.split(','))

# Calculate result
result = a + b

# Output result
print(result)`;
                    break;
                case 'space':
                    template = `# Read space-separated input
input_line = input().strip()
a, b = map(int, input_line.split())

# Calculate result
result = a + b

# Output result
print(result)`;
                    break;
                case 'newline':
                    template = `# Read newline-separated input
a = int(input())
b = int(input())

# Calculate result
result = a + b

# Output result
print(result)`;
                    break;
                case 'single':
                    template = `# Read single input
n = int(input())

# Calculate result
result = n * 2

# Output result
print(result)`;
                    break;
            }
        } else if (language === 'java') {
            switch (inputFormat) {
                case 'comma':
                    template = `import java.util.Scanner;

public class TestCode {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        String[] parts = input.split(",");
        int a = Integer.parseInt(parts[0].trim());
        int b = Integer.parseInt(parts[1].trim());
        
        int result = a + b;
        System.out.println(result);
    }
}`;
                    break;
                case 'space':
                    template = `import java.util.Scanner;

public class TestCode {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        
        int result = a + b;
        System.out.println(result);
    }
}`;
                    break;
                case 'newline':
                    template = `import java.util.Scanner;

public class TestCode {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        
        int result = a + b;
        System.out.println(result);
    }
}`;
                    break;
                case 'single':
                    template = `import java.util.Scanner;

public class TestCode {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        
        int result = n * 2;
        System.out.println(result);
    }
}`;
                    break;
            }
        }
        
        document.getElementById('codeEditor').value = template;
        this.showMessage('Template loaded successfully!', 'success');
    }

    clearCode() {
        if (confirm('Are you sure you want to clear the code editor?')) {
            document.getElementById('codeEditor').value = '';
            this.showMessage('Code editor cleared', 'info');
        }
    }

    generateTestCases() {
        const language = document.getElementById('programmingLanguage').value;
        const inputFormat = document.getElementById('inputFormat').value;
        
        // Clear existing test cases
        document.getElementById('testCasesContainer').innerHTML = '';
        
        let testCases = [];
        
        if (language === 'python' || language === 'java') {
            switch (inputFormat) {
                case 'comma':
                    testCases = [
                        { input: '1,2', expected: '3', description: 'Basic addition' },
                        { input: '5,10', expected: '15', description: 'Larger numbers' },
                        { input: '0,0', expected: '0', description: 'Zero values' },
                        { input: '-1,1', expected: '0', description: 'Negative number' }
                    ];
                    break;
                case 'space':
                    testCases = [
                        { input: '1 2', expected: '3', description: 'Basic addition' },
                        { input: '5 10', expected: '15', description: 'Larger numbers' },
                        { input: '0 0', expected: '0', description: 'Zero values' },
                        { input: '-1 1', expected: '0', description: 'Negative number' }
                    ];
                    break;
                case 'newline':
                    testCases = [
                        { input: '1\n2', expected: '3', description: 'Basic addition' },
                        { input: '5\n10', expected: '15', description: 'Larger numbers' },
                        { input: '0\n0', expected: '0', description: 'Zero values' },
                        { input: '-1\n1', expected: '0', description: 'Negative number' }
                    ];
                    break;
                case 'single':
                    testCases = [
                        { input: '5', expected: '10', description: 'Double the number' },
                        { input: '10', expected: '20', description: 'Larger number' },
                        { input: '0', expected: '0', description: 'Zero value' },
                        { input: '-3', expected: '-6', description: 'Negative number' }
                    ];
                    break;
            }
        }
        
        testCases.forEach((testCase, index) => {
            this.addTestCase(testCase.input, testCase.expected, testCase.description);
        });
        
        this.showMessage(`Generated ${testCases.length} test cases!`, 'success');
    }

    addTestCase(input = '', expected = '', description = '') {
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
                <textarea class="form-control test-input" rows="3" placeholder="Enter input values (one per line)">${input}</textarea>
                <small class="form-text text-muted">Enter each input value on a separate line</small>
            </div>
            <div class="mb-2">
                <label class="form-label">Expected Output</label>
                <textarea class="form-control test-expected" rows="2" placeholder="Expected output">${expected}</textarea>
            </div>
            <div class="mb-2">
                <label class="form-label">Description (Optional)</label>
                <input type="text" class="form-control test-description" placeholder="Test description" value="${description}">
            </div>
        `;
        
        container.appendChild(testCase);

        // Add event listener to remove button
        testCase.querySelector('.remove-test-case').addEventListener('click', () => {
            testCase.remove();
            this.updateTestCaseNumbers();
        });
    }

    clearTestCases() {
        if (confirm('Are you sure you want to clear all test cases?')) {
            document.getElementById('testCasesContainer').innerHTML = '';
            this.addTestCase(); // Add one empty test case
            this.showMessage('All test cases cleared', 'info');
        }
    }

    handleLanguageChange() {
        const language = document.getElementById('programmingLanguage').value;
        const codeEditor = document.getElementById('codeEditor');
        const codeHint = document.getElementById('codeHint');
        
        // Update placeholder based on language
        switch (language) {
            case 'python':
                codeEditor.placeholder = 'Enter your Python code here...\n\nExample:\na = int(input())\nb = int(input())\nprint(a + b)';
                codeHint.innerHTML = '<i class="fas fa-info-circle me-2"></i><strong>Important Note:</strong> In Python, the <code>input()</code> function returns a string. For mathematical operations, use <code>int(input())</code> or <code>float(input())</code> for type conversion.';
                break;
            case 'java':
                codeEditor.placeholder = 'Enter your Java code here...\n\nExample:\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int a = scanner.nextInt();\n        int b = scanner.nextInt();\n        System.out.println(a + b);\n    }\n}';
                codeHint.innerHTML = '<i class="fas fa-info-circle me-2"></i><strong>Java Tip:</strong> Use <code>Scanner</code> class to read input, <code>nextInt()</code> directly returns integer type.';
                break;
            case 'javascript':
                codeEditor.placeholder = 'Enter your JavaScript code here...\n\nExample:\nconst readline = require(\'readline\');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.question(\'\', (a) => {\n    rl.question(\'\', (b) => {\n        console.log(parseInt(a) + parseInt(b));\n        rl.close();\n    });\n});';
                codeHint.innerHTML = '<i class="fas fa-info-circle me-2"></i><strong>JavaScript Tip:</strong> Use <code>parseInt()</code> or <code>parseFloat()</code> to convert strings to numbers.';
                break;
        }
        
        // Show message about language change
        this.showMessage(`Switched to ${language.charAt(0).toUpperCase() + language.slice(1)}`, 'info');
    }

    handleInputFormatChange() {
        const inputFormat = document.getElementById('inputFormat').value;
        const testCases = document.querySelectorAll('.test-input');
        
        // Update existing test case placeholders
        testCases.forEach(input => {
            switch (inputFormat) {
                case 'comma':
                    input.placeholder = 'e.g., 1,2,3';
                    break;
                case 'space':
                    input.placeholder = 'e.g., 1 2 3';
                    break;
                case 'newline':
                    input.placeholder = 'e.g., 1 (first line), 2 (second line)';
                    break;
                case 'single':
                    input.placeholder = 'e.g., 5';
                    break;
            }
        });
    }

    async debugCode() {
        const code = document.getElementById('codeEditor').value;
        const language = document.getElementById('programmingLanguage').value;
        const testCases = this.getTestCases();

        if (!code.trim()) {
            this.showMessage('Please enter some code to debug', 'error');
            return;
        }

        if (testCases.length === 0) {
            this.showMessage('Please add at least one test case', 'error');
            return;
        }

        try {
            // Add debug information to code
            const debugCode = this.addDebugInfo(code, language);
            
            const response = await fetch(`/api/code-test/${language}`, {
                method: 'POST',
                headers: window.auth.getAuthHeaders(),
                body: JSON.stringify({ 
                    code: debugCode, 
                    testCases: testCases.slice(0, 1) // Only test first case in debug mode
                })
            });

            const result = await response.json();

            if (result.success) {
                this.displayDebugResults(result);
            } else {
                this.showMessage(result.error || 'Error debugging code', 'error');
            }

        } catch (error) {
            console.error('Error debugging code:', error);
            this.showMessage('Error debugging code', 'error');
        }
    }

    addDebugInfo(code, language) {
        if (language === 'python') {
            return `import sys

# Debug: Print input received
print("DEBUG: Starting program", file=sys.stderr)

${code}

# Debug: Print final result
print("DEBUG: Program completed", file=sys.stderr)`;
        } else if (language === 'java') {
            return `import java.util.Scanner;

public class TestCode {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // Debug: Print debug info
        System.err.println("DEBUG: Starting program");
        
        ${code}
        
        // Debug: Print final result
        System.err.println("DEBUG: Program completed");
    }
}`;
        }
        return code;
    }

    displayDebugResults(result) {
        const resultsContainer = document.getElementById('testResults');
        
        let html = `
            <div class="mb-3">
                <h6>Debug Results</h6>
                <div class="alert alert-info">
                    <strong>Debug Mode:</strong> This shows detailed execution information
                </div>
            </div>
        `;

        result.testResults.forEach((test, index) => {
            const statusClass = test.passed ? 'success' : 'danger';
            const statusIcon = test.passed ? 'check' : 'times';
            
            html += `
                <div class="test-result mb-2 p-2 border rounded">
                    <div class="d-flex justify-content-between align-items-center">
                        <strong>Debug Test Case ${index + 1}</strong>
                        <span class="badge bg-${statusClass}">
                            <i class="fas fa-${statusIcon} me-1"></i>${test.passed ? 'PASS' : 'FAIL'}
                        </span>
                    </div>
                    <div class="mt-2">
                        <small><strong>Input:</strong> ${test.input}</small><br>
                        <small><strong>Expected:</strong> ${test.expectedOutput}</small><br>
                        <small><strong>Actual:</strong> ${test.actualOutput}</small>
                        ${test.error ? `<br><small class="text-warning"><strong>Debug Output:</strong> ${test.error}</small>` : ''}
                    </div>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
    }

    getTestCases() {
        const testCases = [];
        document.querySelectorAll('.test-case').forEach((testCase, index) => {
            const input = testCase.querySelector('.test-input').value;
            const expected = testCase.querySelector('.test-expected').value;
            
            if (input.trim() && expected.trim()) {
                // Convert textarea line breaks to \n for backend processing
                const processedInput = input.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                
                testCases.push({
                    input: processedInput,
                    expectedOutput: expected.trim(),
                    description: `Test case ${index + 1}`
                });
            }
        });
        return testCases;
    }

    // Profile management methods
    async showProfile() {
        try {
            console.log('Starting profile load...');
            
            // First try to get user from local storage (fallback)
            const localUser = window.auth.getCurrentUser();
            if (localUser) {
                console.log('Using local user data:', localUser);
                this.fillProfileForm(localUser);
                this.displayRolePermissions(localUser.role);
                new bootstrap.Modal(document.getElementById('profileModal')).show();
                return;
            }
            
            // Try to fetch from API
            console.log('Auth headers:', window.auth.getAuthHeaders());
            
            const response = await fetch('/api/auth/me', {
                headers: window.auth.getAuthHeaders()
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                
                // If API fails but we have local user data, use that
                if (localUser) {
                    console.log('API failed, using local user data as fallback');
                    this.fillProfileForm(localUser);
                    this.displayRolePermissions(localUser.role);
                    new bootstrap.Modal(document.getElementById('profileModal')).show();
                    return;
                }
                
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Profile data received:', data);
            
            const user = data.user;
            if (!user) {
                throw new Error('No user data received from server');
            }

            this.fillProfileForm(user);
            this.displayRolePermissions(user.role);
            new bootstrap.Modal(document.getElementById('profileModal')).show();

        } catch (error) {
            console.error('Error loading profile:', error);
            
            // Final fallback: try to use local storage data
            const localUser = window.auth.getCurrentUser();
            if (localUser) {
                console.log('Using local user data as final fallback');
                this.fillProfileForm(localUser);
                this.displayRolePermissions(localUser.role);
                new bootstrap.Modal(document.getElementById('profileModal')).show();
                this.showMessage('Profile loaded from local data (server unavailable)', 'warning');
            } else {
                this.showMessage(`Error loading profile information: ${error.message}`, 'error');
            }
        }
    }

    fillProfileForm(user) {
        // Fill profile form
        document.getElementById('profileUsername').value = user.username || '';
        document.getElementById('profileFirstName').value = user.firstName || '';
        document.getElementById('profileLastName').value = user.lastName || '';
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profileRole').value = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
        document.getElementById('profileStatus').value = user.isActive !== undefined ? (user.isActive ? 'Active' : 'Inactive') : 'Unknown';
        document.getElementById('profileLastLogin').value = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never';
        document.getElementById('profileCreatedAt').value = user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown';
    }

    displayRolePermissions(role) {
        const permissionsContainer = document.getElementById('rolePermissions');
        let permissions = [];

        switch (role) {
            case 'student':
                permissions = [
                    { icon: 'fas fa-eye', text: 'View questions and answers' },
                    { icon: 'fas fa-code', text: 'Test code in Code Testing section' },
                    { icon: 'fas fa-search', text: 'Search and filter questions' }
                ];
                break;
            case 'teacher':
                permissions = [
                    { icon: 'fas fa-eye', text: 'View questions and answers' },
                    { icon: 'fas fa-plus', text: 'Create new questions' },
                    { icon: 'fas fa-edit', text: 'Edit existing questions' },
                    { icon: 'fas fa-lightbulb', text: 'Add/edit question answers' },
                    { icon: 'fas fa-file-import', text: 'Import questions from files' },
                    { icon: 'fas fa-file-export', text: 'Export questions to files' },
                    { icon: 'fas fa-chart-bar', text: 'View question statistics' },
                    { icon: 'fas fa-code', text: 'Test code in Code Testing section' },
                    { icon: 'fas fa-search', text: 'Search and filter questions' }
                ];
                break;
            case 'admin':
                permissions = [
                    { icon: 'fas fa-eye', text: 'View questions and answers' },
                    { icon: 'fas fa-plus', text: 'Create new questions' },
                    { icon: 'fas fa-edit', text: 'Edit existing questions' },
                    { icon: 'fas fa-trash', text: 'Delete questions' },
                    { icon: 'fas fa-lightbulb', text: 'Add/edit question answers' },
                    { icon: 'fas fa-file-import', text: 'Import questions from files' },
                    { icon: 'fas fa-file-export', text: 'Export questions to files' },
                    { icon: 'fas fa-chart-bar', text: 'View question statistics' },
                    { icon: 'fas fa-code', text: 'Test code in Code Testing section' },
                    { icon: 'fas fa-search', text: 'Search and filter questions' },
                    { icon: 'fas fa-users', text: 'Manage user accounts (future feature)' }
                ];
                break;
        }

        let html = `<div class="role-badge mb-3">
            <span class="badge bg-${this.getRoleColor(role)} fs-6">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
        </div>`;

        html += '<ul class="list-unstyled">';
        permissions.forEach(permission => {
            html += `
                <li class="mb-2">
                    <i class="${permission.icon} me-2 text-primary"></i>
                    ${permission.text}
                </li>
            `;
        });
        html += '</ul>';

        permissionsContainer.innerHTML = html;
    }

    getRoleColor(role) {
        switch (role) {
            case 'student': return 'success';
            case 'teacher': return 'primary';
            case 'admin': return 'danger';
            default: return 'secondary';
        }
    }

    async saveProfile() {
        try {
            const profileData = {
                firstName: document.getElementById('profileFirstName').value,
                lastName: document.getElementById('profileLastName').value,
                email: document.getElementById('profileEmail').value
            };

            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: window.auth.getAuthHeaders(),
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.showMessage('Profile updated successfully!', 'success');
            
            // Update user display name in navbar
            this.displayUserInfo();
            
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();

        } catch (error) {
            console.error('Error updating profile:', error);
            this.showMessage(`Error updating profile: ${error.message}`, 'error');
        }
    }

    async changePassword(event) {
        event.preventDefault();
        
        try {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                this.showMessage('New passwords do not match', 'error');
                return;
            }

            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: window.auth.getAuthHeaders(),
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            this.showMessage('Password changed successfully!', 'success');
            document.getElementById('changePasswordForm').reset();

        } catch (error) {
            console.error('Error changing password:', error);
            this.showMessage(`Error changing password: ${error.message}`, 'error');
        }
    }

    // User Management Methods (Admin Only)
    async loadUsers() {
        try {
            console.log('Loading users...');
            console.log('Auth headers:', window.auth.getAuthHeaders());
            
            const response = await fetch('/api/users', {
                headers: window.auth.getAuthHeaders()
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Users data received:', data);
            this.displayUsers(data.users);
            
        } catch (error) {
            console.error('Error loading users:', error);
            this.showMessage(`Error loading users: ${error.message}`, 'error');
        }
    }

    displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td><span class="badge bg-${this.getRoleColor(user.role)}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></td>
                <td><span class="badge bg-${user.isActive ? 'success' : 'danger'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="app.editUser('${user._id}')" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteUser('${user._id}')" title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    showAddUserModal() {
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
        document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-user-plus me-2"></i>Add New User';
        document.getElementById('userPassword').required = true;
        new bootstrap.Modal(document.getElementById('userModal')).show();
    }

    async editUser(userId) {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                headers: window.auth.getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const user = await response.json();
            
            // Fill form with user data
            document.getElementById('userId').value = user._id;
            document.getElementById('userUsername').value = user.username;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userFirstName').value = user.firstName;
            document.getElementById('userLastName').value = user.lastName;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userStatus').value = user.isActive.toString();
            document.getElementById('userPassword').required = false;
            document.getElementById('userPassword').placeholder = 'Leave blank to keep current password';
            
            document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-user-edit me-2"></i>Edit User';
            new bootstrap.Modal(document.getElementById('userModal')).show();
            
        } catch (error) {
            console.error('Error loading user:', error);
            this.showMessage(`Error loading user: ${error.message}`, 'error');
        }
    }

    async saveUser() {
        try {
            const userId = document.getElementById('userId').value;
            const userData = {
                username: document.getElementById('userUsername').value,
                email: document.getElementById('userEmail').value,
                firstName: document.getElementById('userFirstName').value,
                lastName: document.getElementById('userLastName').value,
                role: document.getElementById('userRole').value,
                isActive: document.getElementById('userStatus').value === 'true'
            };

            // Add password only if provided
            const password = document.getElementById('userPassword').value;
            if (password) {
                userData.password = password;
            }

            const url = userId ? `/api/users/${userId}` : '/api/users';
            const method = userId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    ...window.auth.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.showMessage(result.message, 'success');
            
            // Close modal and refresh users list
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            this.loadUsers();

        } catch (error) {
            console.error('Error saving user:', error);
            this.showMessage(`Error saving user: ${error.message}`, 'error');
        }
    }

    async deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/users/${userId}`, {
                    method: 'DELETE',
                    headers: window.auth.getAuthHeaders()
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                this.showMessage(result.message, 'success');
                this.loadUsers();

            } catch (error) {
                console.error('Error deleting user:', error);
                this.showMessage(`Error deleting user: ${error.message}`, 'error');
            }
        }
    }

    searchUsers(searchTerm) {
        // Implement search functionality
        if (searchTerm.trim()) {
            this.loadUsersWithSearch(searchTerm);
        } else {
            this.loadUsers();
        }
    }

    async loadUsersWithSearch(searchTerm) {
        try {
            const response = await fetch(`/api/users?search=${encodeURIComponent(searchTerm)}`, {
                headers: window.auth.getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayUsers(data.users);
            
        } catch (error) {
            console.error('Error searching users:', error);
            this.showMessage(`Error searching users: ${error.message}`, 'error');
        }
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