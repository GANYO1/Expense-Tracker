// Shared error message element
const errorMessage = document.getElementById("error-message");

// ─── REGISTER ───────────────────────────────────────────
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const registerBtn = document.getElementById("register-btn");

if (registerBtn) {
    registerBtn.addEventListener('click', async function(event) {
        event.preventDefault();

        const email = registerEmail.value;
        const password = registerPassword.value;

        if (!email || !password) {
            if (errorMessage) {
                errorMessage.style.color = 'red';
                errorMessage.textContent = 'Email and password are required';
            }
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            const data = response.json();

            if (response.ok) {
                if (errorMessage) {
                    errorMessage.style.color = 'green';
                    errorMessage.textContent = 'Registration successful! Redirecting...';
                }
                setTimeout(function() {
                    window.location.href = 'http://127.0.0.1:5500/frontend/login.html';
                }, 1500);
            } else {
                if (errorMessage) {
                    errorMessage.style.color = 'red';
                    errorMessage.textContent = response.data.error || 'Registration failed';
                }
            }
        } catch(error){
            console.log('Error submitting:', error);
        }
    });
}

// ─── LOGIN ──────────────────────────────────────────────
const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

if (loginForm) {
    loginForm.addEventListener('click', async function(event) {
        event.preventDefault();

        const email = loginEmail.value;
        const password = loginPassword.value;

        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            const data = response.json();

            if (response.ok) {
                    localStorage.setItem('token', response.data.access_token);
                    window.location.replace('http://127.0.0.1:5500/frontend/dashboard.html');
                } else {
                    if (errorMessage) {
                        errorMessage.textContent = response.data.error || 'Login failed';
                    }
                }
            } catch(error) {
                console.log('Error:', error);
        }
    });
}