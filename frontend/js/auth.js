// 1. Wait for the HTML to finish loading
document.addEventListener('DOMContentLoaded', function() {

    // 2. Environment Setup & Helpers
    // FIX: lowercase 'window' (JavaScript is case-sensitive!)
    const isLocal = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';

    const API_BASE_URL = isLocal
        ? 'http://127.0.0.1:5000/api/v1'
        : '/api/v1';

    const errorMessage = document.getElementById("error-message");

    function showMessage(text, isError = true) {
        if (errorMessage) {
            errorMessage.style.color = isError ? 'red' : 'green';
            errorMessage.textContent = text;
        }
    }

    // Helper: Safely parse JSON (prevents crashes if Flask returns HTML on a 500 error)
    async function parseResponse(response) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return { error: 'Server returned an invalid response.' };
    }

    // ─── REGISTER ───────────────────────────────────────────
    const registerForm = document.getElementById("register-form");
    const registerBtn = document.getElementById("register-btn");
    const registerEmail = document.getElementById("register-email");
    const registerPassword = document.getElementById("register-password");

    // Use form submit if available, otherwise fallback to button click
    const registerTarget = registerForm || registerBtn;
    const registerEventType = registerForm ? 'submit' : 'click';

    if (registerTarget) {
        registerTarget.addEventListener(registerEventType, async function(event) {
            event.preventDefault();

            const email = registerEmail.value.trim();
            const password = registerPassword.value;

            if (!email || !password) {
                showMessage('Email and password are required.');
                return;
            }

            if (registerBtn) {
                registerBtn.disabled = true;
                registerBtn.textContent = 'Registering...';
            }

            // Send data to the backend
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await parseResponse(response);

                if (response.ok) {
                    showMessage('Registration successful! Redirecting...', false);
                    setTimeout(function() {
                        window.location.href = '/frontend/login.html';
                    }, 1500);
                } else {
                    showMessage(data.error || 'Registration failed.');
                }
            } catch (error) {
                console.error('Register error:', error);
                showMessage('Network error. Please check your connection.');
            } finally {
                if (registerBtn) {
                    registerBtn.disabled = false;
                    registerBtn.textContent = 'Sign Up';
                }
            }
        });
    }

    // ─── LOGIN ──────────────────────────────────────────────
    const loginForm = document.getElementById("login-form");
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");
    const loginBtn = document.getElementById("login-btn");

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = loginEmail.value.trim();
            const password = loginPassword.value;

            if (!email || !password) {
                showMessage('Email and password are required.');
                return;
            }

            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.textContent = 'Logging in...';
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await parseResponse(response);

                if (response.ok) {
                    if (data.access_token) {
                        localStorage.setItem('token', data.access_token);
                        window.location.replace('/frontend/dashboard.html');
                    } else {
                        showMessage('Login succeeded but no token was received.');
                    }
                } else {
                    showMessage(data.error || 'Invalid email or password.');
                }
            } catch (error) {
                console.error('Login error:', error);
                showMessage('Network error. Please check your connection.');
            } finally {
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                }
            }
        });
    }
});