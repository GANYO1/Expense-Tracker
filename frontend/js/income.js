// 1. Wait for the HTML to finish loading
document.addEventListener('DOMContentLoaded', function() {

    // --- Environment Setup ---
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    const API_BASE_URL = isLocal 
        ? 'http://127.0.0.1:5000/api/v1' 
        : '/api/v1';
    
    // 2. Auth Guard (Fail Fast)
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/frontend/login.html';
        return; 
    }

    // 3. Grab DOM Elements (Added description input)
    const incomeForm = document.getElementById('income-form');
    const amountInput = document.getElementById('income-amount');
    const sourceInput = document.getElementById('income-source');
    const descInput = document.getElementById('income-description'); // NEW
    const dateInput = document.getElementById('income-date');
    const tableBody = document.getElementById('income-table-body');
    const submitBtn = incomeForm ? incomeForm.querySelector('button[type="submit"]') : null;

    // Helper: Format numbers into Ghanaian Cedis (GH₵ 1,500.00)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GH', { 
            style: 'currency', 
            currency: 'GHS' 
        }).format(amount);
    };

    // 4. GET Incomes (Read)
    async function loadIncomes() {
        if (!tableBody) return;
        
        // FIX: Updated colspan to 5
        tableBody.innerHTML = '<tr><td colspan="5">Loading incomes...</td></tr>';

        try {
            const response = await fetch(`${API_BASE_URL}/incomes`, {
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

            const incomes = Array.isArray(data) ? data : (data.incomes || data.income || []);

            if (incomes.length === 0) {
                // FIX: Updated colspan to 5
                tableBody.innerHTML = '<tr><td colspan="5">No income recorded yet.</td></tr>';
                return;
            }

            incomes.forEach(function(inc, index) {
                const row = tableBody.insertRow();
                
                row.insertCell().textContent = index + 1;
                row.insertCell().textContent = formatCurrency(inc.amount);
                row.insertCell().textContent = inc.source; 
                row.insertCell().textContent = inc.description || ''; // NEW: Render description
                row.insertCell().textContent = inc.date;
            });

        } catch(error) {
            console.error('Error loading:', error);
            // FIX: Updated colspan to 5
            tableBody.innerHTML = '<tr><td colspan="5" style="color:red;">Failed to load data.</td></tr>';
        }
    }

    loadIncomes();

    // 5. POST Income (Create)
    if (incomeForm) {
        incomeForm.addEventListener('submit', async function(event) {
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
                const response = await fetch(`${API_BASE_URL}/incomes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        amount: amount,
                        source: sourceInput.value.trim(),
                        description: descInput.value.trim(), // NEW: Send description to Flask
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
                    incomeForm.reset();
                    await loadIncomes(); 
                } else {
                    alert(data.error || 'Failed to save income.');
                }
            } catch(error) {
                console.error('Error submitting:', error);
                alert('Network error. Please check your connection.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Add Income';
                }
            }
        });
    }
});