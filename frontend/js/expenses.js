const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'http://127.0.0.1:5500/frontend/login.html';
}

const expenseForm = document.getElementById('expense-form');
const expenseAmount = document.getElementById('expense-amount');
const expenseDescription = document.getElementById('expense-description');
const expenseCategory = document.getElementById('expense-category');
const expenseDate = document.getElementById('expense-date');
const expenseTableBody = document.getElementById('expense-table-body');

async function loadExpenses() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/expenses', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
        }
    });
        const data = response.json();

        // clear the table first
        expenseTableBody.innerHTML = '';

        // Add new category to the table
        data.expenses.forEach(function(expense, index) {
            const row = document.createElement('tr')

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${expense.amount}</td>
                <td>${expense.description}</td>
                <td>${expense.category_id}</td>
                <td>${expense.date}</td>
            `;

            expenseTableBody.appendChild(row);
        });
    } catch(error) {
        console.log('Error loading:', error);
    };
}

// Load expenses when the page load
loadExpenses();

if (expenseForm) {
    expenseForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/expenses', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    amount: expenseAmount.value,
                    description: expenseDescription.value,
                    category: expenseCategory.value,
                    date: expenseDate.value
                })
            });  
            
            const data = response.json();

            if (response.ok) {
                expenseForm.reset();
                loadExpenses();
            } else {
                alert(data.error)
            };
        } catch(error) {
            console.log('Error submitting:', error);
        }
    });
}