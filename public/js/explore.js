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
    
  fetch('/api/posts') // Fetch data from the backend API
    .then(res => res.json())
    .then(response => {
      if (response.data && response.data.length > 0) {
        const container = document.getElementById('posts-container');
        response.data.forEach(post => {
          const card = document.createElement('div');
          card.className = 'col-md-4';
          card.innerHTML = `
            <div class="card h-auto mb-4">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <h5 class="card-title fw-bold">${post.Title}</h5>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary edit-btn">Edit</button>
                    <button class="btn btn-sm btn-outline-danger delete-btn onclick="deleteMyPost"">Delete</button>
                  </div>
                </div>
                <p class="card-text">By ${post.UserName}</p>
                <p class="card-text">Published on ${new Date(post.Created).toLocaleDateString()}</p>
                <p class="card-text">${post.Description || 'No description available.'}</p>
                <p class="card-text">Likes: ${post.LikeCount || 0}</p>
              </div>
            </div>
          `;

          container.appendChild(card);
        });
      } else {
        console.error('No posts found.');
      }
    })
    .catch(err => {
      console.error('Error loading posts:', err);
    });
});


function deleteMyPost (){ 
    const token = localStorage.getItem('accessToken');
    const user = parseJwt(token);
    if (!user) {
        alert('You must be logged in to delete a post.');
        return;
    }
    const post_ID = this.parentElement.parentElement.parentElement.querySelector('.card-title').textContent;
    console.log('Post ID:', post_ID);
    fetch('/api/posts/deletepost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ post_ID })
    })
    .then(res => res.json())
    .then(response => {
        if (response.message) {
            alert(response.message);
            window.location.reload();
        } else {
            alert(response.error || 'Error deleting post');
        }
    })
    .catch(err => {
        console.error('Error deleting post:', err);
    });
}