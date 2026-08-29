// 1. Abstract the environment
// FIX: Added 127.0.0.1 to the check so it works perfectly with Live Server
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1';

const API_BASE_URL = isLocal 
    ? 'http://127.0.0.1:5000/api/v1' 
    : '/api/v1'; 

// Helper: Safe JSON parser (prevents crashes if Flask returns an HTML 500 error page)
async function parseResponse(response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }
    return { error: 'Server returned an invalid response.' };
}

// 2. Wait for the DOM to be fully loaded before manipulating it
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/frontend/login.html'; 
        return; 
    }

    loadDashboard(token);
});

async function loadDashboard(token) {
    // UX: Show a loading state immediately so the user knows something is happening
    const balanceEl = document.getElementById('balance');
    if (balanceEl) balanceEl.textContent = 'Loading...';

    try {
        const response = await fetch(`${API_BASE_URL}/summary`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // 3. First Principle: Check if the server actually approved the request
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/frontend/login.html';
                return;
            }
            throw new Error(`Server error: ${response.status}`);
        }

        // 4. Await the JSON parsing safely
        const data = await parseResponse(response);

        // 5. Format currency properly for the Ghanaian context
        const formatCurrency = (amount) => {
            // FIX: Fallback to 0 if the amount is null/undefined to prevent "GH₵NaN"
            const safeAmount = amount || 0; 
            return new Intl.NumberFormat('en-GH', {
                style: 'currency',
                currency: 'GHS',
                minimumFractionDigits: 2
            }).format(safeAmount);
        };

        // 6. Safely update the DOM (checking if elements exist first)
        const incomeEl = document.getElementById('total-income');
        const expenseEl = document.getElementById('total-expense');
        
        if (incomeEl) incomeEl.textContent = formatCurrency(data.total_income);
        if (expenseEl) expenseEl.textContent = formatCurrency(data.total_expense);
        if (balanceEl) balanceEl.textContent = formatCurrency(data.balance);

    } catch (error) {
        // 7. Show a user-friendly error
        console.error('Dashboard load failed:', error);
        const balanceEl = document.getElementById('balance');
        if (balanceEl) balanceEl.textContent = 'Error loading data';
    }
}