function parseJwt(token) {
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Set username in navbar if logged in
    const token = localStorage.getItem('accessToken');
    const user = parseJwt(token);
    if (user && user.userName) {
        const userNameElement = document.getElementById('UserName');
        if (userNameElement) userNameElement.textContent = user.userName;
    }

    const form = document.getElementById('newPostForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('postTitle').value;
            const description = document.getElementById('contentArea').value;

            if (!token) {
                alert('You must be logged in to create a post.');
                return;
            }

            try {
                const response = await fetch('/api/posts/newpost', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, description })
                });

                let result;
                try {
                    result = await response.json();
                } catch {
                    alert('Server error: response was not valid JSON');
                    return;
                }

                if (response.ok) {
                    alert(result.message);
                    window.location.href = 'home.html';
                } else {
                    alert(result.error || 'Error creating post');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                alert('Network error or server is down.');
            }
        });
    } else {
        console.log('New post form not found');
    }
});