// 1. Auth Guard
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'http://127.0.0.1:5500/frontend/login.html';
}

// 2. DOM Elements
const categoryForm = document.getElementById('category-form');
const categoryName = document.getElementById('category-name');
const categoryType = document.getElementById('category-type');
const categoryTableBody = document.getElementById('category-table-body');

// 3. GET Function (Wrapped in async)
async function loadCategories() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/categories', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await response.json();

        // Table building logic goes here
        categoryTableBody.innerHTML = '';
        data.forEach(function(category, index) {
            // build rows
        });
    } catch(error) {
        console.log('Error loading:', error);
    }
}

// 4. Call it
loadCategories();

// 5. POST Event Listener (Callback marked as async)
if (categoryForm) {
    categoryForm.addEventListener('submit', async function(event) { 
        event.preventDefault();

        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/categories', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    name: categoryName.value,
                    type: categoryType.value
                })
            });
            
            const data = await response.json();

            if (response.ok) { 
                categoryForm.reset();
                loadCategories();
            } else {
                alert(data.error);
            } 
        } catch(error) {
            console.log('Error submitting:', error);
        }
    });   
}
