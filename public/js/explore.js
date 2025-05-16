function parseJwt(token) {
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
  // ...username logic...

  fetch('/api/posts')
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
                    <button class="btn btn-sm btn-outline-primary">Edit</button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-post-id="${post.Post_ID}">Delete</button>
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

        // Attach delete logic
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const postId = btn.getAttribute('data-post-id');
            const token = localStorage.getItem('accessToken');
            if (!token) {
              alert('You must be logged in to delete a post.');
              return;
            }
            if (!confirm('Are you sure you want to delete this post?')) return;

            try {
              const response = await fetch('/api/posts/deletepost', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ post: postId })
              });
              const result = await response.json();
              if (response.ok) {
                alert(result.message);
                window.location.reload();
              } else {
                alert(result.error || 'Error deleting post');
              }
            } catch (err) {
              console.error('Fetch error:', err);
              alert('Network error or server is down.');
            }
          });
        });

      } else {
        console.error('No posts found.');
      }
    })
    .catch(err => {
      console.error('Error loading posts:', err);
    });
});