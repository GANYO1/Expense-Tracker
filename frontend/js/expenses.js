// 1. Wait for the HTML to finish loading before running JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // --- ADDED: Environment Setup ---
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    const API_BASE_URL = isLocal 
        ? 'http://127.0.0.1:5000/api/v1' 
        : '/api/v1';
    // --------------------------------

    // 2. Auth Guard (Fail Fast)
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/frontend/login.html'; 
        return; 
    }

    // 3. Grab DOM Elements
    const expenseForm = document.getElementById('expense-form');
    const amountInput = document.getElementById('expense-amount');
    const descInput = document.getElementById('expense-description');
    const categoryInput = document.getElementById('expense-category');
    const dateInput = document.getElementById('expense-date');
    const tableBody = document.getElementById('expense-table-body');
    const submitBtn = expenseForm ? expenseForm.querySelector('button[type="submit"]') : null;

    // Helper function to format numbers into Ghanaian Cedis (GH₵ 150.00)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GH', { 
            style: 'currency', 
            currency: 'GHS' 
        }).format(amount);
    };

    // 4. GET Expenses (Read)
    async function loadExpenses() {
        if (!tableBody) return;
        
        tableBody.innerHTML = '<tr><td colspan="5">Loading expenses...</td></tr>';

        try {
            // UPDATED: Added API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/frontend/login.html';
                return;
            }

            if (!response.ok) throw new Error('Server error');

            const data = await response.json(); 
            
            tableBody.innerHTML = ''; 

            const expenses = Array.isArray(data) ? data : (data.expenses || []);

            if (expenses.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5">No expenses recorded yet.</td></tr>';
                return;
            }

            expenses.forEach(function(expense, index) {
                const row = tableBody.insertRow();
                
                row.insertCell().textContent = index + 1;
                row.insertCell().textContent = formatCurrency(expense.amount); 
                row.insertCell().textContent = expense.description; 
                row.insertCell().textContent = expense.category_id || 'N/A';
                row.insertCell().textContent = expense.date;
            });

        } catch(error) {
            console.error('Error loading:', error);
            tableBody.innerHTML = '<tr><td colspan="5" style="color:red;">Failed to load data.</td></tr>';
        }
    }

    loadExpenses();

    // 5. POST Expense (Create)
    if (expenseForm) {
        expenseForm.addEventListener('submit', async function(event) {
            event.preventDefault(); 

            const amount = parseFloat(amountInput.value);
            if (!amount || amount <= 0) {
                alert('Please enter a valid amount greater than 0.');
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Saving...';
            }

            try {
                // UPDATED: Added API_BASE_URL
                const response = await fetch(`${API_BASE_URL}/expenses`, {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        amount: amount,
                        description: descInput.value.trim(), 
                        category_id: categoryInput.value,    
                        date: dateInput.value
                    })
                });

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/frontend/login.html';
                    return;
                }

                let data = {};
                if (response.headers.get('content-type')?.includes('application/json')) {
                    data = await response.json(); 
                }

                if (response.ok) {
                    expenseForm.reset();
                    await loadExpenses(); 
                } else {
                    alert(data.error || 'Failed to save expense.');
                }
            } catch(error) {
                console.error('Error submitting:', error);
                alert('Network error. Please check your connection.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Add Expense';
                }
            }
        });
    }
});