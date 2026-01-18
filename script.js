// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Form switching functions
function showSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

// Simple user storage (in real app, this would be a database)
let users = JSON.parse(localStorage.getItem('users')) || [];

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login');
    const signupForm = document.getElementById('signup');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Find user
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Store current user
                localStorage.setItem('currentUser', JSON.stringify(user));
                // Redirect to welcome page
                window.location.href = 'welcome.html';
            } else {
                showMessage('Invalid email or password', 'error');
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validation
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
                showMessage('User already exists with this email', 'error');
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                password: password
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            showMessage('Account created successfully! Please login.', 'success');
            
            // Switch to login form after 2 seconds
            setTimeout(() => {
                showLogin();
            }, 2000);
        });
    }
});

// Welcome page functionality
if (window.location.pathname.includes('welcome.html')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Redirect to login if no user is logged in
        window.location.href = 'index.html';
    } else {
        // Display welcome message
        document.getElementById('welcomeMessage').textContent = `Hello, ${currentUser.name}!`;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Helper function to show messages
function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.error, .success');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    
    // Add to active form
    const activeForm = document.querySelector('.form-container:not(.hidden)');
    if (activeForm) {
        activeForm.appendChild(messageDiv);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}