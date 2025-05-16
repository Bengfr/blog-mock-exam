function parseJwt(token) {
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
} 
document.addEventListener('DOMContentLoaded', () => {
// Fetch the username from the session and replaces the placeholder with the acual username. good for checking if the user is logged in or not.
const token = localStorage.getItem('accessToken');
const user = parseJwt(token);
    if (user && user.userName) {
        const userNameElement = document.getElementById('UserName');
        if (userNameElement) userNameElement.textContent = user.userName;
    }

    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted');
            const loginEmail = document.getElementById('loginEmail').value;
            const loginPassword = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ loginEmail, loginPassword })
                });
                console.log('Fetch completed');
                const result = await response.json();
                console.log('Result:', result);
                if (result.accessToken) {
                    localStorage.setItem('accessToken', result.accessToken);
                    console.log('Token stored, redirecting...');
                    window.location.href = 'home.html';
                } else {
                    alert(result.error || 'Login failed');
                }
            } catch (err) {
                console.error('Fetch error:', err);
            }
        });
    } else {
        console.log('Login form not found');
    }
});