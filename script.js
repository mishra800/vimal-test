// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Script loading verification
console.log('🚀 Car Seizure Management System - Script Loading Started');
console.log('📅 Script loaded at:', new Date().toISOString());

// Enhanced Authentication System

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
    console.error('Error message:', e.message);
    console.error('Error filename:', e.filename);
    console.error('Error line:', e.lineno);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

console.log('✅ Error handlers initialized');

// Current authentication state
let currentLoginMethod = 'email';
let currentSignupMethod = 'email';
let otpData = {};
let resendTimer = null;

// Camera functionality variables
let cameraStream = null;
let capturedPhotoData = null;
let currentDocumentType = null;

// Ensure DOM is loaded before executing functions
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing authentication system');
    
    // Test if elements exist
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    console.log('Login form found:', !!loginForm);
    console.log('Signup form found:', !!signupForm);
    
    // Initialize default admin if needed
    createDefaultAdmin();
    
    // Set up event listeners
    setupEventListeners();
});

function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // The form event listeners are already set up in the main DOMContentLoaded handler
    // This function is for any additional setup
    
    console.log('Event listeners set up complete');
}

// Form switching functions
function showSignup() {
    console.log('Showing signup form');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm && signupForm) {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    } else {
        console.error('Login or signup form not found');
    }
}

function showLogin() {
    console.log('Showing login form');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm && signupForm) {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    } else {
        console.error('Login or signup form not found');
    }
}

// Ensure functions are globally accessible
window.showSignup = showSignup;
window.showLogin = showLogin;

// Login method switching
function switchLoginMethod(method) {
    try {
        currentLoginMethod = method;
        
        // Update tab appearance
        const emailTab = document.getElementById('emailLoginTab');
        const phoneTab = document.getElementById('phoneLoginTab');
        const emailForm = document.getElementById('emailLogin');
        const phoneForm = document.getElementById('phoneLogin');
        
        if (emailTab && phoneTab && emailForm && phoneForm) {
            emailTab.classList.toggle('active', method === 'email');
            phoneTab.classList.toggle('active', method === 'phone');
            
            // Show/hide forms
            emailForm.classList.toggle('active', method === 'email');
            phoneForm.classList.toggle('active', method === 'phone');
            
            // Reset phone login steps
            if (method === 'phone') {
                resetPhoneLogin();
            }
        } else {
            console.error('Login method elements not found');
        }
    } catch (error) {
        console.error('Error switching login method:', error);
    }
}

// Signup method switching
function switchSignupMethod(method) {
    try {
        currentSignupMethod = method;
        
        // Update tab appearance
        const emailTab = document.getElementById('emailSignupTab');
        const phoneTab = document.getElementById('phoneSignupTab');
        const emailForm = document.getElementById('emailSignup');
        const phoneForm = document.getElementById('phoneSignup');
        
        if (emailTab && phoneTab && emailForm && phoneForm) {
            emailTab.classList.toggle('active', method === 'email');
            phoneTab.classList.toggle('active', method === 'phone');
            
            // Show/hide forms
            emailForm.classList.toggle('active', method === 'email');
            phoneForm.classList.toggle('active', method === 'phone');
            
            // Reset phone signup steps
            if (method === 'phone') {
                resetPhoneSignup();
            }
        } else {
            console.error('Signup method elements not found');
        }
    } catch (error) {
        console.error('Error switching signup method:', error);
    }
}

// Ensure functions are globally accessible
window.switchLoginMethod = switchLoginMethod;
window.switchSignupMethod = switchSignupMethod;

// Password visibility toggle
function togglePassword(inputId) {
    try {
        const input = document.getElementById(inputId);
        const button = input ? input.nextElementSibling : null;
        
        if (input && button) {
            if (input.type === 'password') {
                input.type = 'text';
                button.textContent = '🙈';
            } else {
                input.type = 'password';
                button.textContent = '👁️';
            }
        } else {
            console.error('Password input or toggle button not found:', inputId);
        }
    } catch (error) {
        console.error('Error toggling password visibility:', error);
    }
}

// Ensure function is globally accessible
window.togglePassword = togglePassword;

// Username availability check
function checkUsernameAvailability() {
    const username = document.getElementById('signupUsername').value.trim();
    const statusDiv = document.getElementById('usernameStatus');
    
    if (username.length < 3) {
        statusDiv.textContent = '';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const exists = users.some(user => user.username === username);
    
    if (exists) {
        statusDiv.textContent = '❌ Taken';
        statusDiv.className = 'username-status taken';
    } else {
        statusDiv.textContent = '✅ Available';
        statusDiv.className = 'username-status available';
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    const strengthDiv = document.getElementById('passwordStrength');
    if (!strengthDiv) return;
    
    let strength = 0;
    let feedback = [];
    
    if (password.length >= 8) strength++;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) strength++;
    else feedback.push('Lowercase letter');
    
    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('Uppercase letter');
    
    if (/\d/.test(password)) strength++;
    else feedback.push('Number');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    else feedback.push('Special character');
    
    let strengthText = '';
    let strengthClass = '';
    
    if (strength < 2) {
        strengthText = 'Weak';
        strengthClass = 'strength-weak';
    } else if (strength < 4) {
        strengthText = 'Medium';
        strengthClass = 'strength-medium';
    } else {
        strengthText = 'Strong';
        strengthClass = 'strength-strong';
    }
    
    if (password.length > 0) {
        strengthDiv.innerHTML = `Password strength: <span class="${strengthClass}">${strengthText}</span>`;
        if (feedback.length > 0 && strength < 4) {
            strengthDiv.innerHTML += `<br><small>Missing: ${feedback.join(', ')}</small>`;
        }
    } else {
        strengthDiv.innerHTML = '';
    }
}

// Phone number OTP functions
function sendOTP() {
    const countryCode = document.getElementById('countryCode').value;
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    
    if (!phoneNumber || phoneNumber.length < 10) {
        showMessage('Please enter a valid phone number', 'error');
        return;
    }
    
    const fullNumber = countryCode + phoneNumber;
    
    // Simulate OTP sending (in real app, this would call an API)
    const otp = generateOTP();
    otpData = {
        phone: fullNumber,
        otp: otp,
        timestamp: Date.now(),
        attempts: 0
    };
    
    // Store OTP temporarily (in real app, this would be server-side)
    sessionStorage.setItem('currentOTP', JSON.stringify(otpData));
    
    // Show OTP step
    document.getElementById('phoneStep1').classList.remove('active');
    document.getElementById('phoneStep2').classList.add('active');
    document.getElementById('sentToNumber').textContent = fullNumber;
    
    // Start countdown
    startResendCountdown('resendBtn', 'countdown');
    
    // Simulate SMS (in real app, remove this)
    console.log(`OTP sent to ${fullNumber}: ${otp}`);
    showMessage(`OTP sent to ${fullNumber}`, 'success');
    
    // Focus first OTP input
    document.querySelector('.otp-digit').focus();
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function startResendCountdown(buttonId, countdownId) {
    const button = document.getElementById(buttonId);
    const countdown = document.getElementById(countdownId);
    let timeLeft = 30;
    
    button.disabled = true;
    
    resendTimer = setInterval(() => {
        timeLeft--;
        countdown.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(resendTimer);
            button.disabled = false;
            button.innerHTML = 'Resend OTP';
        }
    }, 1000);
}

function moveToNext(current, index) {
    if (current.value.length === 1 && index < 5) {
        const nextInput = current.parentElement.children[index + 1];
        nextInput.focus();
    }
    
    // Auto-verify when all digits are entered
    if (index === 5 && current.value.length === 1) {
        setTimeout(verifyOTP, 100);
    }
}

function moveToNextSignup(current, index) {
    if (current.value.length === 1 && index < 5) {
        const nextInput = current.parentElement.children[index + 1];
        nextInput.focus();
    }
    
    // Auto-verify when all digits are entered
    if (index === 5 && current.value.length === 1) {
        setTimeout(verifySignupOTP, 100);
    }
}

function verifyOTP() {
    const otpInputs = document.querySelectorAll('#phoneStep2 .otp-digit');
    const enteredOTP = Array.from(otpInputs).map(input => input.value).join('');
    
    if (enteredOTP.length !== 6) {
        showMessage('Please enter complete OTP', 'error');
        return;
    }
    
    const storedOTP = JSON.parse(sessionStorage.getItem('currentOTP'));
    
    if (!storedOTP) {
        showMessage('OTP expired. Please request a new one.', 'error');
        backToPhoneInput();
        return;
    }
    
    // Check if OTP is expired (5 minutes)
    if (Date.now() - storedOTP.timestamp > 5 * 60 * 1000) {
        showMessage('OTP expired. Please request a new one.', 'error');
        sessionStorage.removeItem('currentOTP');
        backToPhoneInput();
        return;
    }
    
    if (enteredOTP === storedOTP.otp) {
        // OTP verified, proceed with login
        loginWithPhone(storedOTP.phone);
        sessionStorage.removeItem('currentOTP');
    } else {
        storedOTP.attempts++;
        if (storedOTP.attempts >= 3) {
            showMessage('Too many failed attempts. Please request a new OTP.', 'error');
            sessionStorage.removeItem('currentOTP');
            backToPhoneInput();
        } else {
            showMessage(`Invalid OTP. ${3 - storedOTP.attempts} attempts remaining.`, 'error');
            sessionStorage.setItem('currentOTP', JSON.stringify(storedOTP));
            // Clear OTP inputs
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        }
    }
}

function loginWithPhone(phoneNumber) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.phone === phoneNumber);
    
    if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
        
        // Store current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Log audit action
        logAuditAction('login_success', 'Phone Login', `User logged in via phone: ${phoneNumber}`);
        
        // Show success message with role-specific redirect info
        if (user.isAdmin) {
            showMessage('Admin login successful! Redirecting to Admin Dashboard...', 'success');
        } else {
            showMessage('Login successful! Redirecting to User Dashboard...', 'success');
        }
        
        // Direct redirect based on user role
        setTimeout(() => {
            if (user.isAdmin) {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
        }, 1500);
    } else {
        showMessage('Phone number not registered. Please sign up first.', 'error');
        backToPhoneInput();
    }
}

function resendOTP() {
    const storedOTP = JSON.parse(sessionStorage.getItem('currentOTP'));
    if (storedOTP) {
        // Generate new OTP
        const newOTP = generateOTP();
        storedOTP.otp = newOTP;
        storedOTP.timestamp = Date.now();
        storedOTP.attempts = 0;
        
        sessionStorage.setItem('currentOTP', JSON.stringify(storedOTP));
        
        // Restart countdown
        startResendCountdown('resendBtn', 'countdown');
        
        console.log(`New OTP sent to ${storedOTP.phone}: ${newOTP}`);
        showMessage('New OTP sent successfully', 'success');
        
        // Clear OTP inputs
        document.querySelectorAll('#phoneStep2 .otp-digit').forEach(input => input.value = '');
        document.querySelector('#phoneStep2 .otp-digit').focus();
    }
}

function backToPhoneInput() {
    document.getElementById('phoneStep2').classList.remove('active');
    document.getElementById('phoneStep1').classList.add('active');
    
    // Clear OTP inputs
    document.querySelectorAll('#phoneStep2 .otp-digit').forEach(input => input.value = '');
    
    // Clear timer
    if (resendTimer) {
        clearInterval(resendTimer);
    }
    
    // Clear stored OTP
    sessionStorage.removeItem('currentOTP');
}

function resetPhoneLogin() {
    document.getElementById('phoneStep1').classList.add('active');
    document.getElementById('phoneStep2').classList.remove('active');
    document.getElementById('phoneNumber').value = '';
    document.querySelectorAll('#phoneStep2 .otp-digit').forEach(input => input.value = '');
    
    if (resendTimer) {
        clearInterval(resendTimer);
    }
    sessionStorage.removeItem('currentOTP');
}

// Phone Signup Functions
function proceedPhoneSignup() {
    const firstName = document.getElementById('phoneSignupFirstName').value.trim();
    const lastName = document.getElementById('phoneSignupLastName').value.trim();
    const countryCode = document.getElementById('signupCountryCode').value;
    const phoneNumber = document.getElementById('signupPhoneNumber').value.trim();
    const password = document.getElementById('phoneSignupPassword').value;
    const isAdmin = document.getElementById('phoneIsAdmin').checked;
    const agreeTerms = document.getElementById('phoneAgreeTerms').checked;
    
    // Validation
    if (!firstName || !lastName || !phoneNumber || !password) {
        showMessage('Please fill all required fields', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showMessage('Please agree to terms and conditions', 'error');
        return;
    }
    
    if (phoneNumber.length < 10) {
        showMessage('Please enter a valid phone number', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    const fullNumber = countryCode + phoneNumber;
    
    // Check if phone number already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.phone === fullNumber)) {
        showMessage('Phone number already registered', 'error');
        return;
    }
    
    // Store signup data temporarily
    const signupData = {
        firstName,
        lastName,
        phone: fullNumber,
        password,
        isAdmin,
        timestamp: Date.now()
    };
    
    sessionStorage.setItem('signupData', JSON.stringify(signupData));
    
    // Send OTP for verification
    const otp = generateOTP();
    otpData = {
        phone: fullNumber,
        otp: otp,
        timestamp: Date.now(),
        attempts: 0
    };
    
    sessionStorage.setItem('signupOTP', JSON.stringify(otpData));
    
    // Show OTP verification step
    document.getElementById('signupStep1').classList.remove('active');
    document.getElementById('signupStep2').classList.add('active');
    document.getElementById('signupSentToNumber').textContent = fullNumber;
    
    // Start countdown
    startResendCountdown('signupResendBtn', 'signupCountdown');
    
    console.log(`Signup OTP sent to ${fullNumber}: ${otp}`);
    showMessage(`Verification code sent to ${fullNumber}`, 'success');
    
    // Focus first OTP input
    document.querySelector('.signup-otp').focus();
}

function verifySignupOTP() {
    const otpInputs = document.querySelectorAll('.signup-otp');
    const enteredOTP = Array.from(otpInputs).map(input => input.value).join('');
    
    if (enteredOTP.length !== 6) {
        showMessage('Please enter complete OTP', 'error');
        return;
    }
    
    const storedOTP = JSON.parse(sessionStorage.getItem('signupOTP'));
    const signupData = JSON.parse(sessionStorage.getItem('signupData'));
    
    if (!storedOTP || !signupData) {
        showMessage('Session expired. Please start again.', 'error');
        backToSignupDetails();
        return;
    }
    
    // Check if OTP is expired (5 minutes)
    if (Date.now() - storedOTP.timestamp > 5 * 60 * 1000) {
        showMessage('OTP expired. Please request a new one.', 'error');
        sessionStorage.removeItem('signupOTP');
        backToSignupDetails();
        return;
    }
    
    if (enteredOTP === storedOTP.otp) {
        // Create user account
        createPhoneUser(signupData);
    } else {
        storedOTP.attempts++;
        if (storedOTP.attempts >= 3) {
            showMessage('Too many failed attempts. Please start again.', 'error');
            sessionStorage.removeItem('signupOTP');
            sessionStorage.removeItem('signupData');
            backToSignupDetails();
        } else {
            showMessage(`Invalid OTP. ${3 - storedOTP.attempts} attempts remaining.`, 'error');
            sessionStorage.setItem('signupOTP', JSON.stringify(storedOTP));
            // Clear OTP inputs
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        }
    }
}

function createPhoneUser(signupData) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Generate username from phone number
    const username = 'user_' + signupData.phone.slice(-6);
    
    const newUser = {
        id: Date.now(),
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        name: `${signupData.firstName} ${signupData.lastName}`,
        username: username,
        phone: signupData.phone,
        password: signupData.password,
        isAdmin: signupData.isAdmin,
        status: 'active',
        createdAt: new Date().toISOString(),
        verifiedPhone: true
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Log audit action
    logAuditAction('user_created', `Phone Signup`, `New user registered via phone: ${signupData.phone}`);
    
    // Clean up session storage
    sessionStorage.removeItem('signupOTP');
    sessionStorage.removeItem('signupData');
    
    showMessage('Account created successfully! Please login.', 'success');
    
    // Switch to login form after 2 seconds
    setTimeout(() => {
        showLogin();
        // Pre-fill phone number in login
        switchLoginMethod('phone');
        document.getElementById('phoneNumber').value = signupData.phone.replace(/^\+\d+/, '');
    }, 2000);
}

function resendSignupOTP() {
    const storedOTP = JSON.parse(sessionStorage.getItem('signupOTP'));
    if (storedOTP) {
        // Generate new OTP
        const newOTP = generateOTP();
        storedOTP.otp = newOTP;
        storedOTP.timestamp = Date.now();
        storedOTP.attempts = 0;
        
        sessionStorage.setItem('signupOTP', JSON.stringify(storedOTP));
        
        // Restart countdown
        startResendCountdown('signupResendBtn', 'signupCountdown');
        
        console.log(`New signup OTP sent to ${storedOTP.phone}: ${newOTP}`);
        showMessage('New verification code sent', 'success');
        
        // Clear OTP inputs
        document.querySelectorAll('.signup-otp').forEach(input => input.value = '');
        document.querySelector('.signup-otp').focus();
    }
}

function backToSignupDetails() {
    document.getElementById('signupStep2').classList.remove('active');
    document.getElementById('signupStep1').classList.add('active');
    
    // Clear OTP inputs
    document.querySelectorAll('.signup-otp').forEach(input => input.value = '');
    
    // Clear timer
    if (resendTimer) {
        clearInterval(resendTimer);
    }
}

function resetPhoneSignup() {
    document.getElementById('signupStep1').classList.add('active');
    document.getElementById('signupStep2').classList.remove('active');
    document.getElementById('phoneSignupFirstName').value = '';
    document.getElementById('phoneSignupLastName').value = '';
    document.getElementById('signupPhoneNumber').value = '';
    document.getElementById('phoneSignupPassword').value = '';
    document.getElementById('phoneIsAdmin').checked = false;
    document.getElementById('phoneAgreeTerms').checked = false;
    document.querySelectorAll('.signup-otp').forEach(input => input.value = '');
    
    if (resendTimer) {
        clearInterval(resendTimer);
    }
    sessionStorage.removeItem('signupOTP');
    sessionStorage.removeItem('signupData');
}

// Forgot Password
function showForgotPassword() {
    document.getElementById('forgotPasswordModal').style.display = 'block';
}

function closeForgotPassword() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
    document.getElementById('forgotPasswordForm').reset();
}

// Simple user storage (in real app, this would be a database)
let users = JSON.parse(localStorage.getItem('users')) || [];

// Create default admin account if no users exist
function createDefaultAdmin() {
    if (users.length === 0) {
        const defaultAdmin = {
            id: 1,
            firstName: "Admin",
            lastName: "User",
            name: "Admin User",
            username: "admin",
            email: "admin@carseizure.com",
            phone: "+919876543210",
            password: "admin123",
            isAdmin: true,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        users.push(defaultAdmin);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Default admin account created:');
        console.log('Email: admin@carseizure.com');
        console.log('Username: admin');
        console.log('Password: admin123');
    }
}

// Initialize default admin on page load
createDefaultAdmin();

// Enhanced login form handler
document.addEventListener('DOMContentLoaded', function() {
    // Authentication check for dashboard pages first
    const currentPage = window.location.pathname.split('/').pop();
    const dashboardPages = [
        'admin-dashboard.html',
        'user-dashboard.html',
        'user-management.html',
        'system-config.html',
        'report-management.html',
        'audit-trail.html',
        'analytics.html'
    ];
    
    if (dashboardPages.includes(currentPage)) {
        if (!checkAuthentication()) {
            return; // Stop execution if authentication fails
        }
    }
    
    // Initialize page-specific functionality
    if (window.location.pathname.includes('user-dashboard.html')) {
        initUserDashboard();
    } else if (window.location.pathname.includes('admin-dashboard.html')) {
        initAdminDashboard();
    } else if (window.location.pathname.includes('user-management.html')) {
        initUserManagement();
    } else if (window.location.pathname.includes('system-config.html')) {
        initSystemConfig();
    } else if (window.location.pathname.includes('report-management.html')) {
        initReportManagement();
    } else if (window.location.pathname.includes('audit-trail.html')) {
        initAuditTrail();
    } else if (window.location.pathname.includes('analytics.html')) {
        initAnalytics();
    }
    
    // Initialize GPS functionality if on user dashboard
    if (window.location.pathname.includes('user-dashboard.html')) {
        initGPSLocation();
        initDocumentUpload();
    }
    
    // Initialize payment tracker if on admin dashboard
    if (window.location.pathname.includes('admin-dashboard.html')) {
        // Payment tracker is initialized via modal
    }
    
    // Login/Signup page functionality
    const emailLoginForm = document.getElementById('emailLogin');
    const emailSignupForm = document.getElementById('emailSignup');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    // Username availability check
    const usernameInput = document.getElementById('signupUsername');
    if (usernameInput) {
        usernameInput.addEventListener('input', checkUsernameAvailability);
    }
    
    // Password strength check
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    // Email/Username Login
    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const identifier = document.getElementById('loginIdentifier').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Find user by email or username
            const user = users.find(u => 
                u.email === identifier || 
                u.username === identifier
            );
            
            if (user && user.password === password) {
                // Update last login
                user.lastLogin = new Date().toISOString();
                localStorage.setItem('users', JSON.stringify(users));
                
                // Store current user
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Remember me functionality
                if (rememberMe) {
                    localStorage.setItem('rememberedUser', identifier);
                }
                
                // Log audit action
                if (typeof logAuditAction === 'function') {
                    logAuditAction('login_success', 'Email/Username Login', `User logged in: ${identifier}`);
                }
                
                // Show success message with role-specific redirect info
                if (user.isAdmin) {
                    showMessage('Admin login successful! Redirecting to Admin Dashboard...', 'success');
                } else {
                    showMessage('Login successful! Redirecting to User Dashboard...', 'success');
                }
                
                // Direct redirect based on user role
                setTimeout(() => {
                    if (user.isAdmin) {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'user-dashboard.html';
                    }
                }, 1500);
            } else {
                if (typeof logAuditAction === 'function') {
                    logAuditAction('login_failed', 'Email/Username Login', `Failed login attempt: ${identifier}`);
                }
                showMessage('Invalid credentials', 'error');
            }
        });
    }
    
    // Email Signup
    if (emailSignupForm) {
        emailSignupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('signupFirstName').value.trim();
            const lastName = document.getElementById('signupLastName').value.trim();
            const username = document.getElementById('signupUsername').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const phone = document.getElementById('signupPhone').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const isAdmin = document.getElementById('isAdmin').checked;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // Validation
            if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
                showMessage('Please fill all required fields', 'error');
                return;
            }
            
            if (!agreeTerms) {
                showMessage('Please agree to terms and conditions', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showMessage('Password must be at least 6 characters', 'error');
                return;
            }
            
            // Check if user already exists
            if (users.find(u => u.email === email)) {
                showMessage('Email already registered', 'error');
                return;
            }
            
            if (users.find(u => u.username === username)) {
                showMessage('Username already taken', 'error');
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now(),
                firstName: firstName,
                lastName: lastName,
                name: `${firstName} ${lastName}`,
                username: username,
                email: email,
                phone: phone,
                password: password,
                isAdmin: isAdmin,
                status: 'active',
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Log audit action
            if (typeof logAuditAction === 'function') {
                logAuditAction('user_created', 'Email Signup', `New user registered: ${email}`);
            }
            
            showMessage('Account created successfully! Please login.', 'success');
            
            // Switch to login form after 2 seconds
            setTimeout(() => {
                showLogin();
                document.getElementById('loginIdentifier').value = email;
            }, 2000);
        });
    }
    
    // Forgot Password
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value.trim();
            const user = users.find(u => u.email === email);
            
            if (user) {
                // In real app, send actual email
                showMessage('Password reset link sent to your email', 'success');
                console.log(`Password reset requested for: ${email}`);
                
                // Log audit action
                if (typeof logAuditAction === 'function') {
                    logAuditAction('password_reset_requested', 'Password Reset', `Reset requested for: ${email}`);
                }
            } else {
                showMessage('Email not found', 'error');
            }
            
            closeForgotPassword();
        });
    }
    
    // Quick Payment Form (if exists)
    const quickPaymentForm = document.getElementById('quickPaymentForm');
    if (quickPaymentForm) {
        quickPaymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitQuickPayment();
        });
    }
    
    // User Form (if exists)
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUser();
        });
    }
    
    // Add search functionality to admin dashboard
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    // Auto-format vehicle number input
    const vehicleInputs = ['vehicleSearchInput', 'paymentVehicleNumber', 'vehicleNumber'];
    vehicleInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                // Convert to uppercase for consistency
                this.value = this.value.toUpperCase();
            });
        }
    });
    
    // Auto-format mobile number input
    const mobileInputs = ['paymentMobileNumber', 'signupPhone', 'phoneNumber', 'signupPhoneNumber'];
    mobileInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                // Remove non-digits
                this.value = this.value.replace(/\D/g, '');
                // Limit to 10 digits for Indian numbers
                if (this.value.length > 10) {
                    this.value = this.value.slice(0, 10);
                }
            });
        }
    });
    
    // Load remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser && document.getElementById('loginIdentifier')) {
        document.getElementById('loginIdentifier').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
    
    // Log page access
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && typeof logAuditAction === 'function') {
        const pageName = window.location.pathname.split('/').pop();
        logAuditAction('page_access', pageName, `Accessed ${pageName}`);
    }
});

// Helper function to show messages
function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Add to active form
    const activeContainer = document.querySelector('.form-container:not(.hidden)');
    if (activeContainer) {
        activeContainer.insertBefore(messageDiv, activeContainer.firstChild);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const forgotModal = document.getElementById('forgotPasswordModal');
    if (event.target === forgotModal) {
        closeForgotPassword();
    }
}

// Car Seizure Report Functionality - Moved to main DOMContentLoaded

// User Dashboard Functions
function initUserDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Display user name
    document.getElementById('userNameDisplay').textContent = currentUser.name;
    
    // Handle photo upload preview
    const photoInput = document.getElementById('vehiclePhoto');
    const photoPreview = document.getElementById('photoPreview');
    
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Vehicle Photo">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Handle form submission
    const seizureForm = document.getElementById('seizureForm');
    seizureForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitSeizureReport();
    });
}

function submitSeizureReport() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const photoInput = document.getElementById('vehiclePhoto');
    
    // Get form data
    const reportData = {
        id: 'SR' + Date.now(),
        submittedBy: currentUser.name,
        submittedById: currentUser.id,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        vehicleInfo: {
            number: document.getElementById('vehicleNumber').value,
            type: document.getElementById('vehicleType').value,
            make: document.getElementById('vehicleMake').value,
            color: document.getElementById('vehicleColor').value
        },
        seizureDetails: {
            location: document.getElementById('seizureLocation').value,
            reason: document.getElementById('seizureReason').value,
            notes: document.getElementById('additionalNotes').value
        }
    };
    
    // Handle photo
    if (photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            reportData.photo = e.target.result;
            saveReport(reportData);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveReport(reportData);
    }
}

function saveReport(reportData) {
    // Get existing reports
    let reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    
    // Add new report
    reports.push(reportData);
    
    // Save to localStorage
    localStorage.setItem('seizureReports', JSON.stringify(reports));
    
    // Show success message
    alert('Report submitted successfully! Report ID: ' + reportData.id);
    
    // Reset form
    document.getElementById('seizureForm').reset();
    document.getElementById('photoPreview').innerHTML = '';
}

// Admin Dashboard Functions
function initAdminDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || !currentUser.isAdmin) {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return;
    }
    
    // Display admin name
    document.getElementById('adminNameDisplay').textContent = currentUser.name + ' (Admin)';
    
    // Load reports
    loadReports();
    updateStats();
}

function loadReports(filter = 'all') {
    const reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    const reportsList = document.getElementById('reportsList');
    
    // Apply filters
    let filteredReports = reports;
    
    if (filter !== 'all') {
        filteredReports = reports.filter(report => report.status === filter);
    }
    
    // Check date filter
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter && dateFilter.value) {
        const filterDate = new Date(dateFilter.value).toDateString();
        filteredReports = filteredReports.filter(report => 
            new Date(report.submittedAt).toDateString() === filterDate
        );
    }
    
    // Sort by submission date (newest first)
    filteredReports.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    // Display reports
    if (filteredReports.length === 0) {
        reportsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No reports found.</p>';
        return;
    }
    
    reportsList.innerHTML = filteredReports.map(report => `
        <div class="report-card" onclick="viewReportDetails('${report.id}')">
            <div class="report-header">
                <span class="report-id">${report.id}</span>
                <span class="report-status status-${report.status}">${report.status}</span>
            </div>
            <div class="report-info">
                <div class="info-item">
                    <span class="info-label">Vehicle Number</span>
                    <span class="info-value">${report.vehicleInfo.number}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Vehicle Type</span>
                    <span class="info-value">${report.vehicleInfo.type}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Location</span>
                    <span class="info-value">${report.seizureDetails.location}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Submitted By</span>
                    <span class="info-value">${report.submittedBy}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Date</span>
                    <span class="info-value">${new Date(report.submittedAt).toLocaleDateString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Reason</span>
                    <span class="info-value">${report.seizureDetails.reason}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    const today = new Date().toDateString();
    
    const totalReports = reports.length;
    const todayReports = reports.filter(report => 
        new Date(report.submittedAt).toDateString() === today
    ).length;
    const pendingReports = reports.filter(report => report.status === 'pending').length;
    
    document.getElementById('totalReports').textContent = totalReports;
    document.getElementById('todayReports').textContent = todayReports;
    document.getElementById('pendingReports').textContent = pendingReports;
}

function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    loadReports(statusFilter);
}

function viewReportDetails(reportId) {
    const reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    const report = reports.find(r => r.id === reportId);
    
    if (!report) return;
    
    const modal = document.getElementById('reportModal');
    const reportDetails = document.getElementById('reportDetails');
    
    reportDetails.innerHTML = `
        <h2>Report Details - ${report.id}</h2>
        
        <div class="report-detail-section">
            <h4>Vehicle Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Vehicle Number</span>
                    <span class="detail-value">${report.vehicleInfo.number}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Type</span>
                    <span class="detail-value">${report.vehicleInfo.type}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Make & Model</span>
                    <span class="detail-value">${report.vehicleInfo.make}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Color</span>
                    <span class="detail-value">${report.vehicleInfo.color}</span>
                </div>
            </div>
        </div>
        
        <div class="report-detail-section">
            <h4>Seizure Details</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${report.seizureDetails.location}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Reason</span>
                    <span class="detail-value">${report.seizureDetails.reason}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Submitted By</span>
                    <span class="detail-value">${report.submittedBy}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date & Time</span>
                    <span class="detail-value">${new Date(report.submittedAt).toLocaleString()}</span>
                </div>
            </div>
            ${report.seizureDetails.notes ? `
                <div class="detail-item" style="margin-top: 15px;">
                    <span class="detail-label">Additional Notes</span>
                    <span class="detail-value">${report.seizureDetails.notes}</span>
                </div>
            ` : ''}
        </div>
        
        ${report.photo ? `
            <div class="report-detail-section">
                <h4>Photo Evidence</h4>
                <div class="photo-evidence">
                    <img src="${report.photo}" alt="Vehicle Photo">
                </div>
            </div>
        ` : ''}
        
        <div class="status-actions">
            <button class="status-btn btn-review" onclick="updateReportStatus('${report.id}', 'reviewed')">
                Mark as Reviewed
            </button>
            <button class="status-btn btn-resolve" onclick="updateReportStatus('${report.id}', 'resolved')">
                Mark as Resolved
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function updateReportStatus(reportId, newStatus) {
    let reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex !== -1) {
        reports[reportIndex].status = newStatus;
        reports[reportIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('seizureReports', JSON.stringify(reports));
        
        // Refresh the display
        loadReports();
        updateStats();
        closeModal();
        
        alert(`Report ${reportId} marked as ${newStatus}`);
    }
}

function closeModal() {
    document.getElementById('reportModal').style.display = 'none';
}

function exportReports() {
    const reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    
    if (reports.length === 0) {
        alert('No reports to export');
        return;
    }
    
    // Create CSV content
    const headers = ['Report ID', 'Vehicle Number', 'Type', 'Make', 'Color', 'Location', 'Reason', 'Status', 'Submitted By', 'Date', 'Notes'];
    const csvContent = [
        headers.join(','),
        ...reports.map(report => [
            report.id,
            report.vehicleInfo.number,
            report.vehicleInfo.type,
            report.vehicleInfo.make,
            report.vehicleInfo.color,
            report.seizureDetails.location,
            report.seizureDetails.reason,
            report.status,
            report.submittedBy,
            new Date(report.submittedAt).toLocaleDateString(),
            report.seizureDetails.notes || ''
        ].join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seizure_reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('reportModal');
    if (event.target === modal) {
        closeModal();
    }
}
// Enhanced Features Implementation

// Enhanced GPS Location Functionality for Mobile Apps
function initGPSLocation() {
    const getLocationBtn = document.getElementById('getLocationBtn');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', getCurrentLocation);
        
        // Add global function exposure for mobile apps
        window.getCurrentLocation = getCurrentLocation;
        
        console.log('GPS functionality initialized for mobile app');
    }
}

function getCurrentLocation() {
    const coordinatesDiv = document.getElementById('coordinates');
    const locationInput = document.getElementById('seizureLocation');
    const locationBtn = document.getElementById('getLocationBtn');
    
    console.log('GPS button clicked - starting location request');
    
    // Show loading state
    if (coordinatesDiv) coordinatesDiv.innerHTML = '🔄 Getting location...';
    if (locationBtn) {
        locationBtn.disabled = true;
        locationBtn.innerHTML = '🔄 Getting GPS...';
    }
    
    // Check for different geolocation APIs (web, Cordova, etc.)
    const geolocationAPI = getGeolocationAPI();
    
    if (!geolocationAPI) {
        handleLocationError('Geolocation is not supported on this device');
        return;
    }
    
    console.log('Using geolocation API:', geolocationAPI.name);
    
    // Enhanced options for mobile apps
    const options = {
        enableHighAccuracy: true,
        timeout: 30000, // Increased timeout for mobile
        maximumAge: 60000 // 1 minute cache
    };
    
    geolocationAPI.getCurrentPosition(
        function(position) {
            console.log('Location success:', position);
            handleLocationSuccess(position, coordinatesDiv, locationInput, locationBtn);
        },
        function(error) {
            console.error('Location error:', error);
            handleLocationError(error.message || 'Unable to get location', coordinatesDiv, locationBtn);
        },
        options
    );
}

function getGeolocationAPI() {
    // Check for Cordova geolocation plugin first
    if (window.cordova && navigator.geolocation) {
        return {
            name: 'Cordova Geolocation',
            getCurrentPosition: navigator.geolocation.getCurrentPosition.bind(navigator.geolocation)
        };
    }
    
    // Check for standard web geolocation
    if (navigator.geolocation) {
        return {
            name: 'Web Geolocation API',
            getCurrentPosition: navigator.geolocation.getCurrentPosition.bind(navigator.geolocation)
        };
    }
    
    // Check for legacy geolocation
    if (window.navigator && window.navigator.geolocation) {
        return {
            name: 'Legacy Geolocation',
            getCurrentPosition: window.navigator.geolocation.getCurrentPosition.bind(window.navigator.geolocation)
        };
    }
    
    return null;
}

function handleLocationSuccess(position, coordinatesDiv, locationInput, locationBtn) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    
    console.log(`Location obtained: ${lat}, ${lng} (accuracy: ${accuracy}m)`);
    
    // Update UI
    if (coordinatesDiv) {
        coordinatesDiv.innerHTML = `📍 Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)} (±${Math.round(accuracy)}m)`;
    }
    
    // Reset button
    if (locationBtn) {
        locationBtn.disabled = false;
        locationBtn.innerHTML = '📍 GPS';
    }
    
    // Try to get address from coordinates
    if (locationInput) {
        reverseGeocode(lat, lng, locationInput);
    }
    
    // Store coordinates for the report
    window.currentCoordinates = { lat, lng, accuracy };
    
    showNotification('Location obtained successfully!', 'success');
}

function handleLocationError(errorMessage, coordinatesDiv, locationBtn) {
    console.error('Location error:', errorMessage);
    
    // Update UI
    if (coordinatesDiv) {
        coordinatesDiv.innerHTML = '❌ Unable to get location';
    }
    
    // Reset button
    if (locationBtn) {
        locationBtn.disabled = false;
        locationBtn.innerHTML = '📍 GPS';
    }
    
    // Show user-friendly error message
    let userMessage = 'Unable to get your location. ';
    
    if (errorMessage.includes('denied') || errorMessage.includes('permission')) {
        userMessage += 'Please enable location permissions for this app.';
    } else if (errorMessage.includes('timeout')) {
        userMessage += 'Location request timed out. Please try again.';
    } else if (errorMessage.includes('unavailable')) {
        userMessage += 'Location service is unavailable. Please check your GPS settings.';
    } else {
        userMessage += 'Please enter the location manually.';
    }
    
    showNotification(userMessage, 'error');
}

function reverseGeocode(lat, lng, locationInput) {
    console.log('Starting reverse geocoding for:', lat, lng);
    
    // Try multiple geocoding services for better reliability
    const geocodingServices = [
        {
            name: 'BigDataCloud',
            url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
            parser: (data) => {
                if (data.locality || data.city) {
                    return `${data.locality || data.city}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`;
                }
                return null;
            }
        },
        {
            name: 'OpenStreetMap',
            url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            parser: (data) => {
                if (data.display_name) {
                    return data.display_name;
                }
                return null;
            }
        }
    ];
    
    // Try each service
    tryGeocoding(geocodingServices, 0, locationInput);
}

function tryGeocoding(services, index, locationInput) {
    if (index >= services.length) {
        console.log('All geocoding services failed');
        return;
    }
    
    const service = services[index];
    console.log(`Trying geocoding service: ${service.name}`);
    
    fetch(service.url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            const address = service.parser(data);
            if (address && locationInput) {
                locationInput.value = address;
                console.log(`Geocoding success with ${service.name}:`, address);
            } else {
                throw new Error('No address found');
            }
        })
        .catch(error => {
            console.log(`Geocoding failed with ${service.name}:`, error);
            // Try next service
            tryGeocoding(services, index + 1, locationInput);
        });
}

// Document Upload Functionality
function initDocumentUpload() {
    const docInputs = ['rcDocument', 'licenseDocument', 'otherDocument'];
    
    docInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', function(e) {
                handleDocumentUpload(e, inputId);
            });
        }
    });
}

function handleDocumentUpload(event, inputId) {
    const file = event.target.files[0];
    const previewId = inputId.replace('Document', 'Preview');
    const previewDiv = document.getElementById(previewId);
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (file.type.startsWith('image/')) {
                previewDiv.innerHTML = `<img src="${e.target.result}" alt="Document Preview">`;
            } else {
                previewDiv.innerHTML = `<p>📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>`;
            }
        };
        reader.readAsDataURL(file);
    }
}

// Enhanced Report Submission
function submitSeizureReport() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const photoInput = document.getElementById('vehiclePhoto');
    
    // Get form data
    const reportData = {
        id: 'SR' + Date.now(),
        submittedBy: currentUser.name,
        submittedById: currentUser.id,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        coordinates: window.currentCoordinates || null,
        vehicleInfo: {
            number: document.getElementById('vehicleNumber').value,
            type: document.getElementById('vehicleType').value,
            make: document.getElementById('vehicleMake').value,
            color: document.getElementById('vehicleColor').value
        },
        seizureDetails: {
            location: document.getElementById('seizureLocation').value,
            reason: document.getElementById('seizureReason').value,
            notes: document.getElementById('additionalNotes').value
        },
        documents: {}
    };
    
    // Handle main photo
    if (photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            reportData.photo = e.target.result;
            processDocuments(reportData);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        processDocuments(reportData);
    }
}

function processDocuments(reportData) {
    const docInputs = ['rcDocument', 'licenseDocument', 'otherDocument'];
    let processedDocs = 0;
    
    docInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                reportData.documents[inputId] = {
                    name: input.files[0].name,
                    data: e.target.result,
                    type: input.files[0].type
                };
                processedDocs++;
                if (processedDocs === docInputs.filter(id => document.getElementById(id).files[0]).length) {
                    saveEnhancedReport(reportData);
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    });
    
    // If no documents, save immediately
    if (docInputs.every(id => !document.getElementById(id).files[0])) {
        saveEnhancedReport(reportData);
    }
}

function saveEnhancedReport(reportData) {
    // Get existing reports
    let reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    
    // Add new report
    reports.push(reportData);
    
    // Save to localStorage
    localStorage.setItem('seizureReports', JSON.stringify(reports));
    
    // Generate QR Code
    generateQRCode(reportData.id);
    
    // Show success message with QR code
    showReportSuccess(reportData);
    
    // Reset form
    document.getElementById('seizureForm').reset();
    document.getElementById('photoPreview').innerHTML = '';
    document.querySelectorAll('.doc-preview').forEach(div => div.innerHTML = '');
}

function generateQRCode(reportId) {
    const qrData = `Report ID: ${reportId}\nView: ${window.location.origin}/report-view.html?id=${reportId}`;
    return qrData;
}

function showReportSuccess(reportData) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Report Submitted Successfully!</h2>
            <p><strong>Report ID:</strong> ${reportData.id}</p>
            <div class="qr-code-container">
                <h4>QR Code for Quick Access</h4>
                <div id="qrcode-${reportData.id}"></div>
                <p>Scan this QR code to quickly access this report</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="submit-btn">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Generate QR code
    setTimeout(() => {
        new QRCode(document.getElementById(`qrcode-${reportData.id}`), {
            text: generateQRCode(reportData.id),
            width: 200,
            height: 200
        });
    }, 100);
}

// Enhanced Admin Dashboard Functions
function loadReports(statusFilter = 'all', searchTerm = '', reasonFilter = 'all', dateFrom = '', dateTo = '') {
    const reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    const reportsList = document.getElementById('reportsList');
    
    // Apply filters
    let filteredReports = reports.filter(report => {
        // Status filter
        if (statusFilter !== 'all' && report.status !== statusFilter) return false;
        
        // Reason filter
        if (reasonFilter !== 'all' && report.seizureDetails.reason !== reasonFilter) return false;
        
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const searchableText = `${report.vehicleInfo.number} ${report.seizureDetails.location} ${report.submittedBy}`.toLowerCase();
            if (!searchableText.includes(searchLower)) return false;
        }
        
        // Date range filter
        const reportDate = new Date(report.submittedAt);
        if (dateFrom && reportDate < new Date(dateFrom)) return false;
        if (dateTo && reportDate > new Date(dateTo + 'T23:59:59')) return false;
        
        return true;
    });
    
    // Sort by submission date (newest first)
    filteredReports.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    // Display reports with enhanced info
    if (filteredReports.length === 0) {
        reportsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No reports found matching your criteria.</p>';
        return;
    }
    
    reportsList.innerHTML = filteredReports.map(report => `
        <div class="report-card" onclick="viewReportDetails('${report.id}')">
            <div class="report-header">
                <span class="report-id">${report.id}</span>
                <span class="report-status status-${report.status}">${report.status}</span>
            </div>
            <div class="report-info">
                <div class="info-item">
                    <span class="info-label">Vehicle Number</span>
                    <span class="info-value">${report.vehicleInfo.number}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Vehicle Type</span>
                    <span class="info-value">${report.vehicleInfo.type}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Location</span>
                    <span class="info-value">${report.seizureDetails.location}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Submitted By</span>
                    <span class="info-value">${report.submittedBy}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Date</span>
                    <span class="info-value">${new Date(report.submittedAt).toLocaleDateString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Reason</span>
                    <span class="info-value">${report.seizureDetails.reason}</span>
                </div>
                ${report.coordinates ? `
                    <div class="info-item">
                        <span class="info-label">GPS Location</span>
                        <span class="info-value">📍 Available</span>
                    </div>
                ` : ''}
                ${Object.keys(report.documents || {}).length > 0 ? `
                    <div class="info-item">
                        <span class="info-label">Documents</span>
                        <span class="info-value">📄 ${Object.keys(report.documents).length} files</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchInput')?.value || '';
    const reasonFilter = document.getElementById('reasonFilter')?.value || 'all';
    const dateFrom = document.getElementById('dateFromFilter')?.value || '';
    const dateTo = document.getElementById('dateToFilter')?.value || '';
    
    loadReports(statusFilter, searchTerm, reasonFilter, dateFrom, dateTo);
}

function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if (document.getElementById('reasonFilter')) document.getElementById('reasonFilter').value = 'all';
    if (document.getElementById('dateFromFilter')) document.getElementById('dateFromFilter').value = '';
    if (document.getElementById('dateToFilter')) document.getElementById('dateToFilter').value = '';
    
    loadReports();
}

// Enhanced Report Details View
function viewReportDetails(reportId) {
    const reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    const report = reports.find(r => r.id === reportId);
    
    if (!report) return;
    
    const modal = document.getElementById('reportModal');
    const reportDetails = document.getElementById('reportDetails');
    
    reportDetails.innerHTML = `
        <h2>Report Details - ${report.id}</h2>
        
        <div class="report-detail-section">
            <h4>Vehicle Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Vehicle Number</span>
                    <span class="detail-value">${report.vehicleInfo.number}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Type</span>
                    <span class="detail-value">${report.vehicleInfo.type}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Make & Model</span>
                    <span class="detail-value">${report.vehicleInfo.make}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Color</span>
                    <span class="detail-value">${report.vehicleInfo.color}</span>
                </div>
            </div>
        </div>
        
        <div class="report-detail-section">
            <h4>Seizure Details</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${report.seizureDetails.location}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Reason</span>
                    <span class="detail-value">${report.seizureDetails.reason}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Submitted By</span>
                    <span class="detail-value">${report.submittedBy}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date & Time</span>
                    <span class="detail-value">${new Date(report.submittedAt).toLocaleString()}</span>
                </div>
            </div>
            ${report.seizureDetails.notes ? `
                <div class="detail-item" style="margin-top: 15px;">
                    <span class="detail-label">Additional Notes</span>
                    <span class="detail-value">${report.seizureDetails.notes}</span>
                </div>
            ` : ''}
        </div>
        
        ${report.coordinates ? `
            <div class="report-detail-section">
                <h4>GPS Location</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Latitude</span>
                        <span class="detail-value">${report.coordinates.lat}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Longitude</span>
                        <span class="detail-value">${report.coordinates.lng}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Map Link</span>
                        <span class="detail-value">
                            <a href="https://maps.google.com/?q=${report.coordinates.lat},${report.coordinates.lng}" target="_blank">
                                View on Google Maps
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        ` : ''}
        
        ${report.photo ? `
            <div class="report-detail-section">
                <h4>Photo Evidence</h4>
                <div class="photo-evidence">
                    <img src="${report.photo}" alt="Vehicle Photo">
                </div>
            </div>
        ` : ''}
        
        ${Object.keys(report.documents || {}).length > 0 ? `
            <div class="report-detail-section">
                <h4>Additional Documents</h4>
                <div class="documents-grid">
                    ${Object.entries(report.documents).map(([key, doc]) => `
                        <div class="document-item">
                            <h5>${key.replace('Document', '').toUpperCase()}</h5>
                            ${doc.type.startsWith('image/') ? 
                                `<img src="${doc.data}" alt="${doc.name}" style="max-width: 200px;">` :
                                `<p>📄 ${doc.name}</p>`
                            }
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <div class="report-detail-section">
            <h4>QR Code</h4>
            <div class="qr-code-container">
                <div id="reportQR-${report.id}"></div>
                <p>Scan to quickly access this report</p>
            </div>
        </div>
        
        <div class="status-actions">
            <button class="status-btn btn-review" onclick="updateReportStatus('${report.id}', 'reviewed')">
                Mark as Reviewed
            </button>
            <button class="status-btn btn-resolve" onclick="updateReportStatus('${report.id}', 'resolved')">
                Mark as Resolved
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // Generate QR code for the report
    setTimeout(() => {
        new QRCode(document.getElementById(`reportQR-${report.id}`), {
            text: generateQRCode(report.id),
            width: 150,
            height: 150
        });
    }, 100);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Initialize enhanced features - Moved to main DOMContentLoaded

// Analytics Functions
function initAnalytics() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = 'index.html';
        return;
    }
    
    loadAnalyticsData();
    createCharts();
}

function loadAnalyticsData() {
    const reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Calculate metrics
    const totalSeizures = reports.length;
    const currentMonth = new Date().getMonth();
    const monthlySeizures = reports.filter(r => new Date(r.submittedAt).getMonth() === currentMonth).length;
    const activeOfficers = users.filter(u => !u.isAdmin).length;
    
    // Calculate average resolution time
    const resolvedReports = reports.filter(r => r.status === 'resolved');
    const avgResolution = resolvedReports.length > 0 ? 
        resolvedReports.reduce((acc, r) => acc + (new Date(r.updatedAt || r.submittedAt) - new Date(r.submittedAt)), 0) / resolvedReports.length / (1000 * 60 * 60) : 0;
    
    // Update metrics display
    document.getElementById('totalSeizures').textContent = totalSeizures;
    document.getElementById('monthlySeizures').textContent = monthlySeizures;
    document.getElementById('avgResolution').textContent = Math.round(avgResolution) + 'h';
    document.getElementById('activeOfficers').textContent = activeOfficers;
    
    // Load top locations
    loadTopLocations(reports);
    
    // Load recent activity
    loadRecentActivity(reports);
}

function loadTopLocations(reports) {
    const locationCounts = {};
    reports.forEach(report => {
        const location = report.seizureDetails.location;
        locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    
    const sortedLocations = Object.entries(locationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const locationsList = document.getElementById('locationsList');
    locationsList.innerHTML = sortedLocations.map(([location, count]) => `
        <div class="location-item">
            <span class="location-name">${location}</span>
            <span class="location-count">${count}</span>
        </div>
    `).join('');
}

function loadRecentActivity(reports) {
    const recentReports = reports
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5);
    
    const activityFeed = document.getElementById('activityFeed');
    activityFeed.innerHTML = recentReports.map(report => `
        <div class="activity-item">
            <div class="activity-icon ${report.status === 'resolved' ? 'resolved' : report.status === 'reviewed' ? 'update' : 'new'}">
                ${report.status === 'resolved' ? '✓' : report.status === 'reviewed' ? '👁' : '📝'}
            </div>
            <div class="activity-content">
                <div class="activity-title">
                    ${report.status === 'resolved' ? 'Resolved' : report.status === 'reviewed' ? 'Reviewed' : 'New'} report for ${report.vehicleInfo.number}
                </div>
                <div class="activity-time">${new Date(report.submittedAt).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

function createCharts() {
    const reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    
    // Status Chart
    createStatusChart(reports);
    
    // Trend Chart
    createTrendChart(reports);
    
    // Reason Chart
    createReasonChart(reports);
    
    // Vehicle Type Chart
    createVehicleChart(reports);
}

function createStatusChart(reports) {
    const statusCounts = {
        pending: reports.filter(r => r.status === 'pending').length,
        reviewed: reports.filter(r => r.status === 'reviewed').length,
        resolved: reports.filter(r => r.status === 'resolved').length
    };
    
    const ctx = document.getElementById('statusChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Reviewed', 'Resolved'],
            datasets: [{
                data: [statusCounts.pending, statusCounts.reviewed, statusCounts.resolved],
                backgroundColor: ['#ffc107', '#17a2b8', '#28a745']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function createTrendChart(reports) {
    // Group reports by month
    const monthlyData = {};
    reports.forEach(report => {
        const month = new Date(report.submittedAt).toISOString().slice(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    
    const sortedMonths = Object.keys(monthlyData).sort();
    const data = sortedMonths.map(month => monthlyData[month]);
    
    const ctx = document.getElementById('trendChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [{
                label: 'Seizures',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function createReasonChart(reports) {
    const reasonCounts = {};
    reports.forEach(report => {
        const reason = report.seizureDetails.reason;
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    
    const ctx = document.getElementById('reasonChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(reasonCounts),
            datasets: [{
                label: 'Count',
                data: Object.values(reasonCounts),
                backgroundColor: '#764ba2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function createVehicleChart(reports) {
    const vehicleCounts = {};
    reports.forEach(report => {
        const type = report.vehicleInfo.type;
        vehicleCounts[type] = (vehicleCounts[type] || 0) + 1;
    });
    
    const ctx = document.getElementById('vehicleChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(vehicleCounts),
            datasets: [{
                data: Object.values(vehicleCounts),
                backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
// Phase 1: Core Admin Tools Implementation

// User Management Functions
function initUserManagement() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = 'index.html';
        return;
    }
    
    loadUserStats();
    loadUsersTable();
    loadOfficersForFilters();
}

function loadUserStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status !== 'inactive').length;
    const totalAdmins = users.filter(u => u.isAdmin).length;
    const totalOfficers = users.filter(u => !u.isAdmin).length;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('totalAdmins').textContent = totalAdmins;
    document.getElementById('totalOfficers').textContent = totalOfficers;
}

function loadUsersTable(roleFilter = 'all', statusFilter = 'all', searchTerm = '') {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('usersTableBody');
    
    // Apply filters
    let filteredUsers = users.filter(user => {
        if (roleFilter !== 'all') {
            if (roleFilter === 'admin' && !user.isAdmin) return false;
            if (roleFilter === 'officer' && user.isAdmin) return false;
        }
        
        if (statusFilter !== 'all') {
            const userStatus = user.status || 'active';
            if (userStatus !== statusFilter) return false;
        }
        
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const searchableText = `${user.name} ${user.email}`.toLowerCase();
            if (!searchableText.includes(searchLower)) return false;
        }
        
        return true;
    });
    
    tbody.innerHTML = filteredUsers.map(user => {
        const reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
        const userReports = reports.filter(r => r.submittedById === user.id).length;
        const status = user.status || 'active';
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never';
        
        return `
            <tr>
                <td>
                    <input type="checkbox" class="user-checkbox" value="${user.id}">
                </td>
                <td>
                    <div>
                        <strong>${user.name}</strong>
                        ${user.isAdmin ? '<span class="role-badge role-admin">Admin</span>' : '<span class="role-badge role-officer">Officer</span>'}
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${user.isAdmin ? 'Admin' : 'Officer'}</td>
                <td>
                    <span class="user-status ${status}">${status}</span>
                </td>
                <td>${lastLogin}</td>
                <td>${userReports}</td>
                <td>
                    <div class="user-actions">
                        <button onclick="editUser('${user.id}')" class="edit-user-btn">Edit</button>
                        <button onclick="toggleUserStatus('${user.id}')" class="toggle-user-btn">
                            ${status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onclick="deleteUser('${user.id}')" class="delete-user-btn">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Update bulk actions visibility
    updateBulkActionsVisibility();
}

function applyUserFilters() {
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('userSearch').value;
    
    loadUsersTable(roleFilter, statusFilter, searchTerm);
}

function showAddUserModal() {
    document.getElementById('userModalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userModal').style.display = 'block';
}

function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id == userId);
    
    if (user) {
        document.getElementById('userModalTitle').textContent = 'Edit User';
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRole').value = user.isAdmin ? 'admin' : 'officer';
        document.getElementById('userDepartment').value = user.department || 'traffic';
        document.getElementById('userBadge').value = user.badgeNumber || '';
        
        // Store user ID for editing
        document.getElementById('userForm').dataset.editingUserId = userId;
        document.getElementById('userModal').style.display = 'block';
    }
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('userForm').reset();
    delete document.getElementById('userForm').dataset.editingUserId;
}

// System Configuration Functions
function initSystemConfig() {
    loadSystemConfiguration();
    loadConfigurableItems();
}

function loadSystemConfiguration() {
    const config = JSON.parse(localStorage.getItem('systemConfig')) || getDefaultConfig();
    
    // Load general settings
    document.getElementById('systemName').value = config.systemName;
    document.getElementById('organizationName').value = config.organizationName;
    document.getElementById('contactEmail').value = config.contactEmail;
    document.getElementById('timezone').value = config.timezone;
    
    // Load notification settings
    document.getElementById('emailNotifications').checked = config.emailNotifications;
    document.getElementById('smsNotifications').checked = config.smsNotifications;
    document.getElementById('pushNotifications').checked = config.pushNotifications;
    document.getElementById('notificationFrequency').value = config.notificationFrequency;
    
    // Load security settings
    document.getElementById('sessionTimeout').value = config.sessionTimeout;
    document.getElementById('passwordMinLength').value = config.passwordMinLength;
    document.getElementById('requirePasswordChange').checked = config.requirePasswordChange;
    document.getElementById('enableAuditLog').checked = config.enableAuditLog;
    
    // Load data management settings
    document.getElementById('dataRetention').value = config.dataRetention;
    document.getElementById('backupFrequency').value = config.backupFrequency;
}

function loadConfigurableItems() {
    const config = JSON.parse(localStorage.getItem('systemConfig')) || getDefaultConfig();
    
    // Load vehicle types
    const vehicleTypesList = document.getElementById('vehicleTypesList');
    vehicleTypesList.innerHTML = config.vehicleTypes.map(type => `
        <div class="list-item">
            <span>${type}</span>
            <button onclick="removeVehicleType('${type}')" class="remove-item-btn">Remove</button>
        </div>
    `).join('');
    
    // Load seizure reasons
    const seizureReasonsList = document.getElementById('seizureReasonsList');
    seizureReasonsList.innerHTML = config.seizureReasons.map(reason => `
        <div class="list-item">
            <span>${reason}</span>
            <button onclick="removeSeizureReason('${reason}')" class="remove-item-btn">Remove</button>
        </div>
    `).join('');
}

function getDefaultConfig() {
    return {
        systemName: 'Car Seizure Management System',
        organizationName: 'Traffic Police Department',
        contactEmail: 'admin@traffic.gov',
        timezone: 'Asia/Kolkata',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notificationFrequency: 'immediate',
        sessionTimeout: 60,
        passwordMinLength: 6,
        requirePasswordChange: false,
        enableAuditLog: true,
        dataRetention: 365,
        backupFrequency: 'daily',
        vehicleTypes: ['car', 'motorcycle', 'truck', 'bus', 'auto'],
        seizureReasons: ['no-documents', 'traffic-violation', 'illegal-parking', 'accident', 'other']
    };
}

function addVehicleType() {
    const input = document.getElementById('newVehicleType');
    const type = input.value.trim();
    
    if (type) {
        const config = JSON.parse(localStorage.getItem('systemConfig')) || getDefaultConfig();
        if (!config.vehicleTypes.includes(type)) {
            config.vehicleTypes.push(type);
            localStorage.setItem('systemConfig', JSON.stringify(config));
            loadConfigurableItems();
            input.value = '';
            showNotification('Vehicle type added successfully', 'success');
        } else {
            showNotification('Vehicle type already exists', 'error');
        }
    }
}

function removeVehicleType(type) {
    const config = JSON.parse(localStorage.getItem('systemConfig')) || getDefaultConfig();
    config.vehicleTypes = config.vehicleTypes.filter(t => t !== type);
    localStorage.setItem('systemConfig', JSON.stringify(config));
    loadConfigurableItems();
    showNotification('Vehicle type removed successfully', 'success');
}

function addSeizureReason() {
    const input = document.getElementById('newSeizureReason');
    const reason = input.value.trim();
    
    if (reason) {
        const config = JSON.parse(localStorage.getItem('systemConfig')) || getDefaultConfig();
        if (!config.seizureReasons.includes(reason)) {
            config.seizureReasons.push(reason);
            localStorage.setItem('systemConfig', JSON.stringify(config));
            loadConfigurableItems();
            input.value = '';
            showNotification('Seizure reason added successfully', 'success');
        } else {
            showNotification('Seizure reason already exists', 'error');
        }
    }
}

function removeSeizureReason(reason) {
    const config = JSON.parse(localStorage.getItem('systemConfig')) || getDefaultConfig();
    config.seizureReasons = config.seizureReasons.filter(r => r !== reason);
    localStorage.setItem('systemConfig', JSON.stringify(config));
    loadConfigurableItems();
    showNotification('Seizure reason removed successfully', 'success');
}

function saveConfiguration() {
    const config = {
        systemName: document.getElementById('systemName').value,
        organizationName: document.getElementById('organizationName').value,
        contactEmail: document.getElementById('contactEmail').value,
        timezone: document.getElementById('timezone').value,
        emailNotifications: document.getElementById('emailNotifications').checked,
        smsNotifications: document.getElementById('smsNotifications').checked,
        pushNotifications: document.getElementById('pushNotifications').checked,
        notificationFrequency: document.getElementById('notificationFrequency').value,
        sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
        passwordMinLength: parseInt(document.getElementById('passwordMinLength').value),
        requirePasswordChange: document.getElementById('requirePasswordChange').checked,
        enableAuditLog: document.getElementById('enableAuditLog').checked,
        dataRetention: parseInt(document.getElementById('dataRetention').value),
        backupFrequency: document.getElementById('backupFrequency').value,
        vehicleTypes: JSON.parse(localStorage.getItem('systemConfig') || '{}').vehicleTypes || getDefaultConfig().vehicleTypes,
        seizureReasons: JSON.parse(localStorage.getItem('systemConfig') || '{}').seizureReasons || getDefaultConfig().seizureReasons
    };
    
    localStorage.setItem('systemConfig', JSON.stringify(config));
    logAuditAction('system', 'Configuration updated', 'System settings modified');
    showNotification('Configuration saved successfully', 'success');
}

function resetConfiguration() {
    if (confirm('Are you sure you want to reset all configuration to defaults? This action cannot be undone.')) {
        localStorage.setItem('systemConfig', JSON.stringify(getDefaultConfig()));
        loadSystemConfiguration();
        loadConfigurableItems();
        logAuditAction('system', 'Configuration reset', 'System configuration reset to defaults');
        showNotification('Configuration reset to defaults', 'success');
    }
}

// Report Management Functions
function initReportManagement() {
    loadReportStats();
    loadOfficersForAssignment();
    loadAdvancedReportsTable();
}

function loadReportStats() {
    const reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    
    const highPriority = reports.filter(r => r.priority === 'high').length;
    const mediumPriority = reports.filter(r => r.priority === 'medium').length;
    const lowPriority = reports.filter(r => r.priority === 'low').length;
    
    // Calculate overdue reports (assuming 7 days for resolution)
    const overdue = reports.filter(r => {
        const daysSinceSubmission = (Date.now() - new Date(r.submittedAt)) / (1000 * 60 * 60 * 24);
        return daysSinceSubmission > 7 && r.status !== 'resolved';
    }).length;
    
    document.getElementById('highPriorityCount').textContent = highPriority;
    document.getElementById('mediumPriorityCount').textContent = mediumPriority;
    document.getElementById('lowPriorityCount').textContent = lowPriority;
    document.getElementById('overdueCount').textContent = overdue;
}

function loadOfficersForAssignment() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const officers = users.filter(u => !u.isAdmin && (u.status || 'active') === 'active');
    
    // Populate assignee filter
    const assigneeFilter = document.getElementById('assigneeFilter');
    assigneeFilter.innerHTML = '<option value="all">All Assignees</option><option value="unassigned">Unassigned</option>';
    officers.forEach(officer => {
        assigneeFilter.innerHTML += `<option value="${officer.id}">${officer.name}</option>`;
    });
    
    // Populate bulk assign modal
    const assignToOfficer = document.getElementById('assignToOfficer');
    if (assignToOfficer) {
        assignToOfficer.innerHTML = '<option value="">Select Officer</option>';
        officers.forEach(officer => {
            assignToOfficer.innerHTML += `<option value="${officer.id}">${officer.name}</option>`;
        });
    }
}

function loadAdvancedReportsTable() {
    const reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('reportsTableBody');
    
    // Add priority and assignment info to reports if not exists
    const enhancedReports = reports.map(report => ({
        ...report,
        priority: report.priority || 'medium',
        assignedTo: report.assignedTo || null,
        dueDate: report.dueDate || null
    }));
    
    tbody.innerHTML = enhancedReports.map(report => {
        const assignedUser = report.assignedTo ? users.find(u => u.id == report.assignedTo) : null;
        const assignedName = assignedUser ? assignedUser.name : 'Unassigned';
        const dueDate = report.dueDate ? new Date(report.dueDate).toLocaleDateString() : 'Not set';
        
        return `
            <tr>
                <td>
                    <input type="checkbox" class="report-checkbox" value="${report.id}">
                </td>
                <td>${report.id}</td>
                <td>${report.vehicleInfo.number}</td>
                <td>
                    <span class="priority-badge priority-${report.priority}">${report.priority}</span>
                </td>
                <td>
                    <span class="report-status status-${report.status}">${report.status}</span>
                </td>
                <td>${assignedName}</td>
                <td>${dueDate}</td>
                <td>${report.seizureDetails.location}</td>
                <td>
                    <div class="user-actions">
                        <button onclick="viewReportDetails('${report.id}')" class="edit-user-btn">View</button>
                        <button onclick="assignReport('${report.id}')" class="toggle-user-btn">Assign</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    updateReportBulkActionsVisibility();
}

// Audit Trail Functions
function initAuditTrail() {
    loadAuditStats();
    loadAuditTable();
    loadUsersForAuditFilter();
    startRealtimeActivityFeed();
}

function loadAuditStats() {
    const auditLog = JSON.parse(localStorage.getItem('auditLog')) || [];
    const today = new Date().toDateString();
    
    const totalActions = auditLog.length;
    const todayActivity = auditLog.filter(entry => 
        new Date(entry.timestamp).toDateString() === today
    ).length;
    
    const activeUsersToday = new Set(
        auditLog
            .filter(entry => new Date(entry.timestamp).toDateString() === today)
            .map(entry => entry.userId)
    ).size;
    
    const failedLogins = auditLog.filter(entry => 
        entry.action === 'login_failed' && 
        new Date(entry.timestamp).toDateString() === today
    ).length;
    
    document.getElementById('totalActions').textContent = totalActions;
    document.getElementById('todayActivity').textContent = todayActivity;
    document.getElementById('activeUsersToday').textContent = activeUsersToday;
    document.getElementById('failedLogins').textContent = failedLogins;
}

function loadAuditTable() {
    const auditLog = JSON.parse(localStorage.getItem('auditLog')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('auditTableBody');
    
    // Sort by timestamp (newest first)
    const sortedLog = auditLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    tbody.innerHTML = sortedLog.slice(0, 100).map(entry => {
        const user = users.find(u => u.id == entry.userId);
        const userName = user ? user.name : 'Unknown User';
        
        return `
            <tr>
                <td>${new Date(entry.timestamp).toLocaleString()}</td>
                <td>${userName}</td>
                <td>${entry.action}</td>
                <td>${entry.resource || '-'}</td>
                <td>${entry.details || '-'}</td>
                <td>${entry.ipAddress || '-'}</td>
                <td>
                    <span class="severity-badge severity-${entry.severity || 'info'}">${entry.severity || 'info'}</span>
                </td>
                <td>${entry.status || 'success'}</td>
            </tr>
        `;
    }).join('');
}

function loadUsersForAuditFilter() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userFilter = document.getElementById('userFilter');
    
    userFilter.innerHTML = '<option value="all">All Users</option>';
    users.forEach(user => {
        userFilter.innerHTML += `<option value="${user.id}">${user.name}</option>`;
    });
}

function logAuditAction(action, resource, details, severity = 'info') {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const auditLog = JSON.parse(localStorage.getItem('auditLog')) || [];
    
    const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        action: action,
        resource: resource,
        details: details,
        severity: severity,
        ipAddress: 'localhost', // In real app, get actual IP
        status: 'success'
    };
    
    auditLog.push(entry);
    
    // Keep only last 1000 entries
    if (auditLog.length > 1000) {
        auditLog.splice(0, auditLog.length - 1000);
    }
    
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
    
    // Update real-time feed if on audit page
    if (window.location.pathname.includes('audit-trail.html')) {
        addToRealtimeFeed(entry);
    }
}

function startRealtimeActivityFeed() {
    // Simulate real-time activity (in real app, this would be WebSocket or SSE)
    setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance every 5 seconds
            simulateActivity();
        }
    }, 5000);
}

function addToRealtimeFeed(entry) {
    const feedContainer = document.getElementById('activityFeedContainer');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id == entry.userId);
    
    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-entry new';
    activityDiv.innerHTML = `
        <div class="activity-details">
            <div class="activity-user">${user ? user.name : 'Unknown User'}</div>
            <div class="activity-action">${entry.action} - ${entry.details}</div>
        </div>
        <div class="activity-timestamp">${new Date(entry.timestamp).toLocaleTimeString()}</div>
    `;
    
    feedContainer.insertBefore(activityDiv, feedContainer.firstChild);
    
    // Remove old entries (keep only 20)
    while (feedContainer.children.length > 20) {
        feedContainer.removeChild(feedContainer.lastChild);
    }
    
    // Remove 'new' class after 3 seconds
    setTimeout(() => {
        activityDiv.classList.remove('new');
    }, 3000);
}

// Initialize appropriate page functions - Moved to main DOMContentLoaded

// Helper function to save user
function saveUser() {
    const form = document.getElementById('userForm');
    const editingUserId = form.dataset.editingUserId;
    
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        isAdmin: document.getElementById('userRole').value === 'admin',
        department: document.getElementById('userDepartment').value,
        badgeNumber: document.getElementById('userBadge').value,
        status: 'active'
    };
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (editingUserId) {
        // Edit existing user
        const userIndex = users.findIndex(u => u.id == editingUserId);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...userData };
            logAuditAction('user_updated', `User ${userData.email}`, `User profile updated`);
            showNotification('User updated successfully', 'success');
        }
    } else {
        // Add new user
        userData.id = Date.now();
        users.push(userData);
        logAuditAction('user_created', `User ${userData.email}`, `New user account created`);
        showNotification('User created successfully', 'success');
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    closeUserModal();
    loadUsersTable();
    loadUserStats();
}

// Bulk operations and other helper functions
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.user-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    
    updateBulkActionsVisibility();
}

function updateBulkActionsVisibility() {
    const checkboxes = document.querySelectorAll('.user-checkbox:checked');
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');
    
    if (checkboxes.length > 0) {
        bulkActions.style.display = 'flex';
        selectedCount.textContent = `${checkboxes.length} users selected`;
    } else {
        bulkActions.style.display = 'none';
    }
}

// Add event listeners for checkboxes
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('user-checkbox')) {
        updateBulkActionsVisibility();
    }
    if (e.target.classList.contains('report-checkbox')) {
        updateReportBulkActionsVisibility();
    }
});

function updateReportBulkActionsVisibility() {
    const checkboxes = document.querySelectorAll('.report-checkbox:checked');
    const bulkActions = document.getElementById('reportBulkActions');
    const selectedCount = document.getElementById('selectedReportsCount');
    
    if (bulkActions && checkboxes.length > 0) {
        bulkActions.style.display = 'flex';
        selectedCount.textContent = `${checkboxes.length} reports selected`;
    } else if (bulkActions) {
        bulkActions.style.display = 'none';
    }
}
// Payment Tracker Functions

// Open Payment Tracker Modal
function openPaymentTracker() {
    document.getElementById('paymentTrackerModal').style.display = 'block';
    // Clear any previous search
    document.getElementById('vehicleSearchInput').value = '';
    document.getElementById('paymentHistoryDisplay').style.display = 'none';
}

// Close Payment Tracker Modal
function closePaymentTracker() {
    document.getElementById('paymentTrackerModal').style.display = 'none';
    clearPaymentForm();
}

// Search Vehicle Payments
function searchVehiclePayments() {
    const vehicleNumber = document.getElementById('vehicleSearchInput').value.trim().toUpperCase();
    
    if (!vehicleNumber) {
        document.getElementById('paymentHistoryDisplay').style.display = 'none';
        return;
    }
    
    // Get payment history for this vehicle
    const vehiclePayments = JSON.parse(localStorage.getItem('vehiclePayments')) || {};
    const paymentHistory = vehiclePayments[vehicleNumber] || [];
    
    const historyDisplay = document.getElementById('paymentHistoryDisplay');
    
    if (paymentHistory.length === 0) {
        historyDisplay.innerHTML = `
            <div class="no-payments-found">
                <span class="icon">🔍</span>
                <h4>No Payment History Found</h4>
                <p>No payments recorded for vehicle number: <strong>${vehicleNumber}</strong></p>
                <p>Use the form below to record the first payment for this vehicle.</p>
            </div>
        `;
        historyDisplay.style.display = 'block';
        
        // Auto-fill the vehicle number in the form
        document.getElementById('paymentVehicleNumber').value = vehicleNumber;
        return;
    }
    
    // Calculate totals
    const totalAmount = paymentHistory.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const paymentCount = paymentHistory.length;
    
    // Get latest payment for vehicle details
    const latestPayment = paymentHistory[paymentHistory.length - 1];
    
    historyDisplay.innerHTML = `
        <div class="payment-history-header">
            <div class="vehicle-info">
                <div class="vehicle-number">${vehicleNumber}</div>
                <div class="vehicle-details">
                    Owner: ${latestPayment.ownerName || 'Not specified'} | 
                    Mobile: ${latestPayment.mobileNumber}
                </div>
            </div>
            <div class="payment-summary">
                <div class="total-payments">₹${totalAmount.toLocaleString()}</div>
                <div class="payment-count">${paymentCount} payment(s)</div>
            </div>
        </div>
        
        <div class="payment-records">
            ${paymentHistory.map((payment, index) => `
                <div class="payment-record">
                    <div class="payment-info">
                        <div class="payment-field">
                            <span class="payment-label">Date</span>
                            <span class="payment-value">${new Date(payment.date).toLocaleDateString()}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Amount</span>
                            <span class="payment-value payment-amount">₹${parseFloat(payment.amount).toLocaleString()}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Type</span>
                            <span class="payment-value">${payment.paymentType}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Method</span>
                            <span class="payment-value">${payment.paymentMethod}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Mobile</span>
                            <span class="payment-value">${payment.mobileNumber}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Recorded By</span>
                            <span class="payment-value">${payment.recordedBy}</span>
                        </div>
                    </div>
                    ${payment.screenshot ? `
                        <div class="payment-screenshot">
                            <img src="${payment.screenshot}" 
                                 alt="Payment Screenshot" 
                                 class="payment-screenshot-thumb"
                                 onclick="viewFullScreenshot('${payment.screenshot}')">
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
    
    historyDisplay.style.display = 'block';
    
    // Auto-fill form with existing details for new payment
    document.getElementById('paymentVehicleNumber').value = vehicleNumber;
    document.getElementById('paymentMobileNumber').value = latestPayment.mobileNumber;
    document.getElementById('paymentOwnerName').value = latestPayment.ownerName || '';
}

// Handle Payment Screenshot Upload
function handlePaymentScreenshot(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size should be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewArea = document.getElementById('screenshotPreviewArea');
        previewArea.innerHTML = `
            <img src="${e.target.result}" alt="Payment Screenshot">
            <div class="screenshot-info">
                <strong>File:</strong> ${file.name}<br>
                <strong>Size:</strong> ${(file.size / 1024).toFixed(1)} KB
            </div>
        `;
        previewArea.style.display = 'block';
        
        // Update upload area appearance
        document.querySelector('.screenshot-upload-area').classList.add('has-file');
        
        // Store the screenshot data
        window.currentPaymentScreenshot = e.target.result;
    };
    reader.readAsDataURL(file);
}

// View Full Screenshot
function viewFullScreenshot(screenshotData) {
    // Create modal for full screenshot view
    const modal = document.createElement('div');
    modal.className = 'screenshot-modal';
    modal.innerHTML = `
        <span class="screenshot-close" onclick="this.parentElement.remove()">&times;</span>
        <div class="screenshot-modal-content">
            <img src="${screenshotData}" alt="Payment Screenshot">
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Close on click outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Handle Quick Payment Form Submission - Moved to main DOMContentLoaded

// Submit Quick Payment
function submitQuickPayment() {
    // Get form data
    const vehicleNumber = document.getElementById('paymentVehicleNumber').value.trim().toUpperCase();
    const mobileNumber = document.getElementById('paymentMobileNumber').value.trim();
    const ownerName = document.getElementById('paymentOwnerName').value.trim();
    const amount = document.getElementById('paymentAmount').value;
    const paymentType = document.getElementById('paymentType').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const screenshot = window.currentPaymentScreenshot;
    
    // Validation
    if (!vehicleNumber || !mobileNumber || !amount) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (!screenshot) {
        showNotification('Please upload payment screenshot', 'error');
        return;
    }
    
    // Validate mobile number (basic validation)
    if (!/^\d{10}$/.test(mobileNumber)) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Create payment record
    const paymentRecord = {
        id: 'PAY' + Date.now(),
        vehicleNumber: vehicleNumber,
        mobileNumber: mobileNumber,
        ownerName: ownerName,
        amount: parseFloat(amount),
        paymentType: paymentType,
        paymentMethod: paymentMethod,
        screenshot: screenshot,
        date: new Date().toISOString(),
        recordedBy: JSON.parse(localStorage.getItem('currentUser')).name,
        recordedAt: new Date().toISOString()
    };
    
    // Get existing vehicle payments
    const vehiclePayments = JSON.parse(localStorage.getItem('vehiclePayments')) || {};
    
    // Initialize array for this vehicle if it doesn't exist
    if (!vehiclePayments[vehicleNumber]) {
        vehiclePayments[vehicleNumber] = [];
    }
    
    // Add new payment record
    vehiclePayments[vehicleNumber].push(paymentRecord);
    
    // Save to localStorage
    localStorage.setItem('vehiclePayments', JSON.stringify(vehiclePayments));
    
    // Log audit action
    logAuditAction('payment_recorded', `Vehicle ${vehicleNumber}`, `Payment of ₹${amount} recorded for vehicle ${vehicleNumber}`);
    
    // Show success message
    showPaymentSuccessMessage(paymentRecord);
    
    // Clear form
    clearPaymentForm();
    
    // Refresh search results if vehicle was being searched
    const searchInput = document.getElementById('vehicleSearchInput');
    if (searchInput.value.trim().toUpperCase() === vehicleNumber) {
        searchVehiclePayments();
    }
}

// Show Payment Success Message
function showPaymentSuccessMessage(paymentRecord) {
    const successDiv = document.createElement('div');
    successDiv.className = 'payment-success-message';
    successDiv.innerHTML = `
        <span class="success-icon">✅</span>
        <div>
            <strong>Payment Recorded Successfully!</strong><br>
            Vehicle: ${paymentRecord.vehicleNumber} | Amount: ₹${paymentRecord.amount.toLocaleString()} | ID: ${paymentRecord.id}
        </div>
    `;
    
    const modal = document.querySelector('.payment-tracker-modal .modal-content');
    modal.insertBefore(successDiv, modal.firstChild);
    
    // Remove success message after 8 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 8000);
    
    // Show notification
    showNotification(`Payment of ₹${paymentRecord.amount.toLocaleString()} recorded for ${paymentRecord.vehicleNumber}`, 'success');
}

// Clear Payment Form
function clearPaymentForm() {
    document.getElementById('quickPaymentForm').reset();
    document.getElementById('screenshotPreviewArea').style.display = 'none';
    document.getElementById('screenshotPreviewArea').innerHTML = '';
    document.querySelector('.screenshot-upload-area').classList.remove('has-file');
    window.currentPaymentScreenshot = null;
}

// Auto-format vehicle number input - Moved to main DOMContentLoaded

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const paymentModal = document.getElementById('paymentTrackerModal');
    if (event.target === paymentModal) {
        closePaymentTracker();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Close payment tracker with Escape key
    if (event.key === 'Escape') {
        const paymentModal = document.getElementById('paymentTrackerModal');
        if (paymentModal.style.display === 'block') {
            closePaymentTracker();
        }
    }
});

// Export Vehicle Payments (bonus feature)
function exportVehiclePayments() {
    const vehiclePayments = JSON.parse(localStorage.getItem('vehiclePayments')) || {};
    
    if (Object.keys(vehiclePayments).length === 0) {
        showNotification('No payment data to export', 'error');
        return;
    }
    
    // Flatten all payments into a single array
    const allPayments = [];
    Object.entries(vehiclePayments).forEach(([vehicleNumber, payments]) => {
        payments.forEach(payment => {
            allPayments.push({
                vehicleNumber: vehicleNumber,
                date: new Date(payment.date).toLocaleDateString(),
                amount: payment.amount,
                paymentType: payment.paymentType,
                paymentMethod: payment.paymentMethod,
                mobileNumber: payment.mobileNumber,
                ownerName: payment.ownerName || '',
                recordedBy: payment.recordedBy
            });
        });
    });
    
    // Create CSV content
    const headers = ['Vehicle Number', 'Date', 'Amount', 'Payment Type', 'Payment Method', 'Mobile Number', 'Owner Name', 'Recorded By'];
    const csvContent = [
        headers.join(','),
        ...allPayments.map(payment => [
            payment.vehicleNumber,
            payment.date,
            payment.amount,
            payment.paymentType,
            payment.paymentMethod,
            payment.mobileNumber,
            payment.ownerName,
            payment.recordedBy
        ].join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicle_payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Payment data exported successfully', 'success');
}
// Logout function
function logout() {
    // Get current user for audit log
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Log audit action if user exists
    if (currentUser) {
        logAuditAction('logout', 'User Logout', `User logged out: ${currentUser.email || currentUser.username || currentUser.phone}`);
    }
    
    // Clear user session
    localStorage.removeItem('currentUser');
    
    // Clear any temporary data
    sessionStorage.clear();
    
    // Show logout message
    console.log('User logged out successfully');
    
    // Redirect to login page
    window.location.href = 'index.html';
}
// Authentication check for dashboard pages
function checkAuthentication() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentPage = window.location.pathname.split('/').pop();
    
    // If no user is logged in, redirect to login
    if (!currentUser) {
        window.location.href = 'index.html';
        return false;
    }
    
    // Check admin-only pages
    const adminPages = [
        'admin-dashboard.html',
        'user-management.html',
        'system-config.html',
        'report-management.html',
        'audit-trail.html',
        'analytics.html'
    ];
    
    if (adminPages.includes(currentPage) && !currentUser.isAdmin) {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'user-dashboard.html';
        return false;
    }
    
    return true;
}

// Run authentication check on page load for dashboard pages - Moved to main DOMContentLoaded
// Welcome page redirect (Remove welcome page from flow)
if (window.location.pathname.includes('welcome.html')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Redirect to login if no user is logged in
        window.location.href = 'index.html';
    } else {
        // Immediately redirect to appropriate dashboard based on role
        if (currentUser.isAdmin) {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    }
}
// Camera Integration for User Dashboard

// Camera variables are already declared at the top of the file
// Removed duplicate declarations to prevent syntax errors

// Enhanced Camera functionality for Mobile Apps
async function openCamera() {
    const cameraPreview = document.getElementById('cameraPreview');
    const video = document.getElementById('cameraVideo');
    
    console.log('Opening camera - checking available APIs');
    
    try {
        // Show loading state
        showCameraLoading();
        
        // Check for different camera APIs (Cordova, Web, etc.)
        const cameraAPI = getCameraAPI();
        
        if (!cameraAPI) {
            throw new Error('No camera API available');
        }
        
        console.log('Using camera API:', cameraAPI.name);
        
        // Use the appropriate camera API
        if (cameraAPI.type === 'cordova') {
            await openCordovaCamera();
        } else if (cameraAPI.type === 'web') {
            await openWebCamera(cameraPreview, video);
        } else {
            throw new Error('Unsupported camera API');
        }
        
    } catch (error) {
        console.error('Camera access error:', error);
        hideCameraLoading();
        showCameraError(error);
    }
}

function getCameraAPI() {
    // Check for Cordova Camera plugin
    if (window.cordova && navigator.camera) {
        return {
            name: 'Cordova Camera Plugin',
            type: 'cordova'
        };
    }
    
    // Check for Cordova Media Capture
    if (window.cordova && navigator.device && navigator.device.capture) {
        return {
            name: 'Cordova Media Capture',
            type: 'cordova-capture'
        };
    }
    
    // Check for standard web camera API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return {
            name: 'Web MediaDevices API',
            type: 'web'
        };
    }
    
    // Check for legacy web camera API
    if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
        return {
            name: 'Legacy getUserMedia',
            type: 'web-legacy'
        };
    }
    
    return null;
}

async function openCordovaCamera() {
    console.log('Using Cordova camera plugin');
    
    return new Promise((resolve, reject) => {
        const options = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 1920,
            targetHeight: 1080,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: false,
            correctOrientation: true,
            saveToPhotoAlbum: false
        };
        
        navigator.camera.getPicture(
            function(imageData) {
                console.log('Cordova camera success');
                const photoData = "data:image/jpeg;base64," + imageData;
                displayCapturedPhoto(photoData);
                hideCameraLoading();
                resolve();
            },
            function(error) {
                console.error('Cordova camera error:', error);
                reject(new Error('Camera capture failed: ' + error));
            },
            options
        );
    });
}

async function openWebCamera(cameraPreview, video) {
    console.log('Using web camera API');
    
    // Request camera permission and stream
    const constraints = {
        video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 }
        }
    };
    
    // Try different getUserMedia implementations
    const getUserMedia = navigator.mediaDevices?.getUserMedia ||
                        navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia;
    
    if (!getUserMedia) {
        throw new Error('Camera API not supported');
    }
    
    let stream;
    if (navigator.mediaDevices?.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
    } else {
        // Legacy API
        stream = await new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
        });
    }
    
    cameraStream = stream;
    
    // Hide loading and show camera
    hideCameraLoading();
    cameraPreview.style.display = 'block';
    video.srcObject = stream;
    
    console.log('Web camera opened successfully');
}

function showCameraLoading() {
    const cameraPreview = document.getElementById('cameraPreview');
    cameraPreview.innerHTML = `
        <div class="camera-loading">
            <div class="spinner"></div>
            <p>Opening camera...</p>
        </div>
    `;
    cameraPreview.style.display = 'block';
}

function hideCameraLoading() {
    const cameraPreview = document.getElementById('cameraPreview');
    cameraPreview.innerHTML = `
        <video id="cameraVideo" autoplay playsinline></video>
        <div class="camera-overlay">
            <div class="camera-frame"></div>
            <div class="camera-actions">
                <button type="button" onclick="capturePhoto()" class="capture-btn">📸</button>
                <button type="button" onclick="closeCamera()" class="close-camera-btn">❌ Close</button>
            </div>
        </div>
    `;
}

function showCameraError(error) {
    const cameraPreview = document.getElementById('cameraPreview');
    let errorMessage = 'Unable to access camera. ';
    
    if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permission and try again.';
    } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
    } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported on this browser.';
    } else {
        errorMessage += 'Please check camera permissions and try again.';
    }
    
    cameraPreview.innerHTML = `
        <div class="camera-error">
            <h4>📷 Camera Error</h4>
            <p>${errorMessage}</p>
            <button onclick="requestCameraPermission()" class="permission-btn">Try Again</button>
            <button onclick="closeCamera()" class="permission-btn" style="margin-left: 10px;">Close</button>
        </div>
    `;
    cameraPreview.style.display = 'block';
}

async function requestCameraPermission() {
    try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        openCamera();
    } catch (error) {
        showCameraError(error);
    }
}

function capturePhoto() {
    console.log('Capturing photo');
    
    // Check if we're using Cordova camera (photo already captured)
    if (window.cordova && navigator.camera && !cameraStream) {
        console.log('Photo already captured via Cordova camera');
        return;
    }
    
    // Web camera capture
    const video = document.getElementById('cameraVideo');
    
    if (!video || !video.srcObject) {
        console.error('No video stream available for capture');
        showNotification('Camera not ready. Please try opening camera again.', 'error');
        return;
    }
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob and display
    canvas.toBlob((blob) => {
        if (!blob) {
            console.error('Failed to create photo blob');
            showNotification('Failed to capture photo. Please try again.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            capturedPhotoData = e.target.result;
            displayCapturedPhoto(capturedPhotoData);
            closeCamera();
        };
        reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.9);
}

function displayCapturedPhoto(photoData) {
    const photoPreview = document.getElementById('photoPreview');
    const fileSize = Math.round((photoData.length * 0.75) / 1024); // Approximate file size in KB
    
    photoPreview.innerHTML = `
        <img src="${photoData}" alt="Captured Vehicle Photo">
        <div class="photo-actions">
            <button onclick="retakePhoto()" class="photo-action-btn retake-btn">🔄 Retake</button>
            <button onclick="deletePhoto()" class="photo-action-btn delete-btn">🗑️ Delete</button>
        </div>
        <div class="photo-quality quality-good">📸 ${fileSize} KB - Good Quality</div>
    `;
    photoPreview.classList.add('active');
    
    // Store photo data for form submission
    window.currentVehiclePhoto = photoData;
    
    showNotification('Photo captured successfully!', 'success');
}

function retakePhoto() {
    openCamera();
}

function deletePhoto() {
    const photoPreview = document.getElementById('photoPreview');
    photoPreview.innerHTML = '';
    photoPreview.classList.remove('active');
    window.currentVehiclePhoto = null;
    showNotification('Photo deleted', 'info');
}

function closeCamera() {
    const cameraPreview = document.getElementById('cameraPreview');
    
    // Stop camera stream
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
            track.stop();
        });
        cameraStream = null;
    }
    
    // Hide camera preview
    cameraPreview.style.display = 'none';
    
    console.log('Camera closed');
}

// Handle photo selection from gallery
function handlePhotoSelection(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        displayCapturedPhoto(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Enhanced document camera functions for mobile apps
async function openDocCamera(docType) {
    currentDocumentType = docType;
    console.log('Opening document camera for:', docType);
    
    try {
        const cameraAPI = getCameraAPI();
        
        if (!cameraAPI) {
            throw new Error('Camera not available');
        }
        
        if (cameraAPI.type === 'cordova') {
            await openCordovaDocumentCamera(docType);
        } else {
            await openWebDocumentCamera(docType);
        }
        
    } catch (error) {
        console.error('Document camera error:', error);
        showNotification('Unable to access camera for document capture. Please use gallery option.', 'error');
    }
}

async function openCordovaDocumentCamera(docType) {
    console.log('Using Cordova camera for document:', docType);
    
    return new Promise((resolve, reject) => {
        const options = {
            quality: 85,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 1280,
            targetHeight: 720,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: false,
            correctOrientation: true,
            saveToPhotoAlbum: false
        };
        
        navigator.camera.getPicture(
            function(imageData) {
                console.log('Cordova document camera success');
                const photoData = "data:image/jpeg;base64," + imageData;
                handleDocumentCapture(docType, photoData);
                resolve();
            },
            function(error) {
                console.error('Cordova document camera error:', error);
                reject(new Error('Document camera failed: ' + error));
            },
            options
        );
    });
}

async function openWebDocumentCamera(docType) {
    console.log('Using web camera for document:', docType);
    
    const constraints = {
        video: {
            facingMode: 'environment',
            width: { ideal: 1280, max: 1280 },
            height: { ideal: 720, max: 720 }
        }
    };
    
    let stream;
    if (navigator.mediaDevices?.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
    } else {
        // Legacy API fallback
        const getUserMedia = navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia;
        
        if (!getUserMedia) {
            throw new Error('Camera API not supported');
        }
        
        stream = await new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
        });
    }
    
    showDocumentCameraModal(stream, docType);
}

function showDocumentCameraModal(stream, docType) {
    // Create modal for document camera
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close" onclick="closeDocumentCamera()">&times;</span>
            <h3>📄 Capture ${docType.toUpperCase()} Document</h3>
            <div class="camera-preview">
                <video id="docCameraVideo" autoplay playsinline style="width: 100%; height: 300px; object-fit: cover;"></video>
                <div class="camera-overlay">
                    <div class="camera-frame"></div>
                    <div class="camera-actions">
                        <button type="button" onclick="captureDocument()" class="capture-btn">📸</button>
                        <button type="button" onclick="closeDocumentCamera()" class="close-camera-btn">❌ Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set video stream
    const video = document.getElementById('docCameraVideo');
    video.srcObject = stream;
    
    // Store stream reference
    window.currentDocStream = stream;
    window.currentDocModal = modal;
}

function captureDocument() {
    const video = document.getElementById('docCameraVideo');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            handleDocumentCapture(currentDocumentType, e.target.result);
            closeDocumentCamera();
        };
        reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.9);
}

function handleDocumentCapture(docType, photoData) {
    const previewId = docType + 'Preview';
    const previewDiv = document.getElementById(previewId);
    
    if (previewDiv) {
        previewDiv.innerHTML = `
            <img src="${photoData}" alt="${docType} Document" style="max-width: 150px; border-radius: 8px;">
            <div class="doc-actions" style="margin-top: 8px;">
                <button onclick="retakeDocument('${docType}')" class="photo-action-btn retake-btn">🔄 Retake</button>
                <button onclick="deleteDocument('${docType}')" class="photo-action-btn delete-btn">🗑️ Delete</button>
            </div>
        `;
        
        // Store document data
        window[`current${docType}Document`] = photoData;
        
        showNotification(`${docType.toUpperCase()} document captured successfully!`, 'success');
    }
}

function closeDocumentCamera() {
    // Stop camera stream
    if (window.currentDocStream) {
        window.currentDocStream.getTracks().forEach(track => {
            track.stop();
        });
        window.currentDocStream = null;
    }
    
    // Remove modal
    if (window.currentDocModal) {
        window.currentDocModal.remove();
        window.currentDocModal = null;
    }
    
    currentDocumentType = null;
}

function retakeDocument(docType) {
    openDocCamera(docType);
}

function deleteDocument(docType) {
    const previewId = docType + 'Preview';
    const previewDiv = document.getElementById(previewId);
    
    if (previewDiv) {
        previewDiv.innerHTML = '';
        window[`current${docType}Document`] = null;
        showNotification(`${docType.toUpperCase()} document deleted`, 'info');
    }
}

// Handle document upload from gallery
function handleDocumentUpload(event, docType) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        showNotification('Please select a valid image or PDF file', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size should be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        handleDocumentCapture(docType, e.target.result);
    };
    reader.readAsDataURL(file);
}

// Enhanced report submission with camera photos
function submitSeizureReport() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Get form data
    const reportData = {
        id: 'SR' + Date.now(),
        submittedBy: currentUser.name,
        submittedById: currentUser.id,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        coordinates: window.currentCoordinates || null,
        vehicleInfo: {
            number: document.getElementById('vehicleNumber').value,
            type: document.getElementById('vehicleType').value,
            make: document.getElementById('vehicleMake').value,
            color: document.getElementById('vehicleColor').value
        },
        seizureDetails: {
            location: document.getElementById('seizureLocation').value,
            reason: document.getElementById('seizureReason').value,
            notes: document.getElementById('additionalNotes').value
        },
        documents: {}
    };
    
    // Validation
    if (!reportData.vehicleInfo.number || !reportData.vehicleInfo.type || !reportData.seizureDetails.location || !reportData.seizureDetails.reason) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Check for vehicle photo (required)
    if (!window.currentVehiclePhoto) {
        showNotification('Vehicle photo is required. Please take a photo or select from gallery.', 'error');
        return;
    }
    
    // Add main vehicle photo
    reportData.photo = window.currentVehiclePhoto;
    
    // Add document photos if available
    if (window.currentrcDocument) {
        reportData.documents.rcDocument = {
            name: 'RC Document',
            data: window.currentrcDocument,
            type: 'image/jpeg'
        };
    }
    
    if (window.currentlicenseDocument) {
        reportData.documents.licenseDocument = {
            name: 'License Document',
            data: window.currentlicenseDocument,
            type: 'image/jpeg'
        };
    }
    
    if (window.currentotherDocument) {
        reportData.documents.otherDocument = {
            name: 'Other Document',
            data: window.currentotherDocument,
            type: 'image/jpeg'
        };
    }
    
    // Save report
    const reports = JSON.parse(localStorage.getItem('seizureReports')) || [];
    reports.push(reportData);
    localStorage.setItem('seizureReports', JSON.stringify(reports));
    
    // Log audit action
    if (typeof logAuditAction === 'function') {
        logAuditAction('report_submitted', `Report ${reportData.id}`, `Car seizure report submitted for vehicle ${reportData.vehicleInfo.number}`);
    }
    
    // Show success message
    showNotification('Report submitted successfully! Report ID: ' + reportData.id, 'success');
    
    // Clear form and photos
    clearReportForm();
}

function clearReportForm() {
    // Clear form fields
    document.getElementById('seizureForm').reset();
    
    // Clear photo previews
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('photoPreview').classList.remove('active');
    document.getElementById('rcPreview').innerHTML = '';
    document.getElementById('licensePreview').innerHTML = '';
    document.getElementById('otherPreview').innerHTML = '';
    
    // Clear stored photo data
    window.currentVehiclePhoto = null;
    window.currentrcDocument = null;
    window.currentlicenseDocument = null;
    window.currentotherDocument = null;
    
    // Clear coordinates
    window.currentCoordinates = null;
    document.getElementById('coordinates').innerHTML = '';
}

// Initialize camera functionality
function initCameraFeatures() {
    console.log('Initializing camera features for mobile app');
    
    // Check available camera APIs
    const cameraAPI = getCameraAPI();
    
    if (!cameraAPI) {
        console.warn('No camera API available - hiding camera buttons');
        // Hide camera buttons and show gallery only
        const cameraButtons = document.querySelectorAll('.camera-btn, .doc-camera-btn');
        cameraButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        
        // Show message about camera unavailability
        const cameraSection = document.querySelector('.camera-section');
        if (cameraSection) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'camera-warning';
            warningDiv.innerHTML = `
                <p>📱 Camera not available on this device.</p>
                <p>Please use the gallery option to select photos.</p>
            `;
            cameraSection.insertBefore(warningDiv, cameraSection.firstChild);
        }
        return;
    }
    
    console.log('Camera API available:', cameraAPI.name);
    
    // Add event listeners for camera functionality
    const cameraButtons = document.querySelectorAll('.camera-btn');
    cameraButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Camera button clicked');
        });
    });
    
    // For Cordova apps, wait for device ready
    if (window.cordova) {
        document.addEventListener('deviceready', function() {
            console.log('Cordova device ready - camera features initialized');
        }, false);
    }
    
    console.log('Camera features initialized successfully');
}

// Close camera when page unloads
window.addEventListener('beforeunload', function() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
            track.stop();
        });
    }
    
    if (window.currentDocStream) {
        window.currentDocStream.getTracks().forEach(track => {
            track.stop();
        });
    }
});

// Initialize camera features when user dashboard loads
if (window.location.pathname.includes('user-dashboard.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        initCameraFeatures();
        
        // Initialize form submission handler
        const seizureForm = document.getElementById('seizureForm');
        if (seizureForm) {
            seizureForm.addEventListener('submit', function(e) {
                e.preventDefault();
                submitSeizureReport();
            });
        }
    });
}

// ===== GLOBAL FUNCTION EXPOSURE =====
// Ensure all functions are accessible globally for onclick handlers

// Authentication functions
window.showSignup = showSignup;
window.showLogin = showLogin;
window.switchLoginMethod = switchLoginMethod;
window.switchSignupMethod = switchSignupMethod;
window.togglePassword = togglePassword;

// GPS and Location functions
if (typeof getCurrentLocation !== 'undefined') window.getCurrentLocation = getCurrentLocation;
if (typeof initGPSLocation !== 'undefined') window.initGPSLocation = initGPSLocation;

// OTP functions
if (typeof sendOTP !== 'undefined') window.sendOTP = sendOTP;
if (typeof verifyOTP !== 'undefined') window.verifyOTP = verifyOTP;
if (typeof resendOTP !== 'undefined') window.resendOTP = resendOTP;
if (typeof backToPhoneInput !== 'undefined') window.backToPhoneInput = backToPhoneInput;
if (typeof proceedPhoneSignup !== 'undefined') window.proceedPhoneSignup = proceedPhoneSignup;
if (typeof verifySignupOTP !== 'undefined') window.verifySignupOTP = verifySignupOTP;
if (typeof resendSignupOTP !== 'undefined') window.resendSignupOTP = resendSignupOTP;
if (typeof backToSignupDetails !== 'undefined') window.backToSignupDetails = backToSignupDetails;
if (typeof moveToNext !== 'undefined') window.moveToNext = moveToNext;
if (typeof moveToNextSignup !== 'undefined') window.moveToNextSignup = moveToNextSignup;

// Modal functions
if (typeof showForgotPassword !== 'undefined') window.showForgotPassword = showForgotPassword;
if (typeof closeForgotPassword !== 'undefined') window.closeForgotPassword = closeForgotPassword;

// Camera functions
if (typeof openCamera !== 'undefined') window.openCamera = openCamera;
if (typeof capturePhoto !== 'undefined') window.capturePhoto = capturePhoto;
if (typeof closeCamera !== 'undefined') window.closeCamera = closeCamera;
if (typeof handlePhotoSelection !== 'undefined') window.handlePhotoSelection = handlePhotoSelection;
if (typeof openDocCamera !== 'undefined') window.openDocCamera = openDocCamera;
if (typeof captureDocument !== 'undefined') window.captureDocument = captureDocument;
if (typeof closeDocumentCamera !== 'undefined') window.closeDocumentCamera = closeDocumentCamera;
if (typeof handleDocumentUpload !== 'undefined') window.handleDocumentUpload = handleDocumentUpload;

// Dashboard functions
if (typeof logout !== 'undefined') window.logout = logout;
if (typeof openPaymentTracker !== 'undefined') window.openPaymentTracker = openPaymentTracker;

// User management functions
if (typeof checkUsernameAvailability !== 'undefined') window.checkUsernameAvailability = checkUsernameAvailability;

console.log('All functions exposed to global scope for onclick handlers');