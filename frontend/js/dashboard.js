const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'http://127.0.0.1:5500/frontend/login.html';
} else {
    // Fetch summary data
async function loadDashboard() {
    try {
        const response = await fetch ('http://127.0.0.1:5000/api/v1/summary', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
        }
    });
        const data = response.json();

        document.getElementById('total-income').textContent = 'GHc' + data.total_income;
        document.getElementById('total-expense').textContent = 'GHc' + data.total_expense;
        document.getElementById('balance').textContent = 'GHc' + data.balance;

    } catch(error) {
        console.log('Error:', error);
    };
}}

loadDashboard();