const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'http://127.0.0.1:5500/frontend/login.html';
}

const incomeForm = document.getElementById('income-form');
const incomeAmount = document.getElementById('income-amount');
const incomeSource = document.getElementById('income-source');
const incomeDate = document.getElementById('income-date');
const incomeTableBody = document.getElementById('income-table-body');

async function loadIncome() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/expenses', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        const data = response.json();

        incomeTableBody.innerHTML = '',

        data.income.forEach(function(income, index) {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${income.amount}</td>
                <td>${income.source}</td>
                <td>${income.date}</td>
            `;
            incomeTableBody.appendChild(row);
        })
    } catch(error){
        console.log('Error loading:', error);
    };

}

loadIncome();

if (incomeForm) {
    incomeForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    amount: incomeAmount.value,
                    source: incomeSource.value,
                    date: incomeDate.value
                })
            });
            
            const data = response.json();

            if (response.ok) {
                incomeForm.reset();
                loadIncome();
            } else {
                alert(data.error);
            }
        } catch(error){
            console.log('Error submitting:', error);
        }
    });
}
        