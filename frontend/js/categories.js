// Wait for the HTML to finish loading before running JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Environment Setup (Consistent with your other files)
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    const API_BASE_URL = isLocal 
        ? 'http://127.0.0.1:5000/api/v1' 
        : '/api/v1';

    // 2. Auth Guard
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/frontend/login.html';
        return; // Stop the code here
    }

    const categoryForm = document.getElementById('category-form');
    const categoryTableBody = document.getElementById('category-table-body');

    // --- Safe JSON Parser ---
    async function parseResponse(response) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return { error: 'Server returned an invalid response (not JSON).' };
    }

    // 3. GET Categories (Read)
    async function loadCategories() {
        // Show loading state (colspan="3" matches the 3 columns in HTML)
        categoryTableBody.innerHTML = '<tr><td colspan="3">Loading categories...</td></tr>';

        try {
            const response = await fetch(`${API_BASE_URL}/categories`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/frontend/login.html';
                return;
            }
            
            if (!response.ok) {
                throw new Error('Server error');
            }

            // Use the safe parser
            const data = await parseResponse(response);
            
            // Handle Data Shape (Array vs Object)
            const categories = Array.isArray(data) ? data : (data.categories || []);

            categoryTableBody.innerHTML = ''; // Clear loading text

            // Handle Empty State
            if (categories.length === 0) {
                categoryTableBody.innerHTML = '<tr><td colspan="3">No categories found. Add one below!</td></tr>';
                return;
            }

            // Loop through categories safely
            // FIX: Added 'index' to generate the SN (Serial Number)
            categories.forEach(function(cat, index) {  
                const row = categoryTableBody.insertRow();  
                
                // 1. Add the SN cell
                const snCell = row.insertCell();
                snCell.textContent = index + 1;

                // 2. Add the Name cell
                const nameCell = row.insertCell();  
                nameCell.textContent = cat.name; 
                
                // 3. Add the Type cell
                const typeCell = row.insertCell();  
                typeCell.textContent = cat.type; 
            });

        } catch (error) {
            console.error('Failed to load:', error);    
            categoryTableBody.innerHTML = '<tr><td colspan="3" style="color:red;">Error loading data.</td></tr>'; 
        }
    }

    loadCategories(); // Run it once when page loads

    // 4. POST Category (Create)
    if (categoryForm) {
        categoryForm.addEventListener('submit', async function(event) {
            event.preventDefault(); 
            
            const nameInput = document.getElementById('category-name');
            const typeInput = document.getElementById('category-type');
            const submitBtn = categoryForm.querySelector('button');

            if (!nameInput.value.trim()) {
                alert('Name is required');  
                return; 
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            try {
                const response = await fetch(`${API_BASE_URL}/categories`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        name: nameInput.value.trim(),
                        type: typeInput.value
                    })
                });

                if (response.status === 401) {  
                    localStorage.removeItem('token');   
                    window.location.href = '/frontend/login.html';  
                    return;
                }

                // Use the safe parser here too
                const data = await parseResponse(response);

                if (response.ok) {
                    categoryForm.reset(); 
                    loadCategories();     
                } else {
                    alert(data.error || 'Failed to add category'); 
                }
            } catch (error) {
                console.error('Submit error:', error);
                alert('Network error. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Add Category';
            }
        });
    }
});