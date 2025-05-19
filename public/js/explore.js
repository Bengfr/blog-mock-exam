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
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-post-id="${post.Post_ID}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-post-id="${post.Post_ID}">Delete</button>
                  </div>
                </div>
                <p class="card-text">By ${post.UserName}</p>
                <p class="card-text">Published on ${new Date(post.Created).toLocaleDateString()}</p>
                <p class="card-text">${post.Description || 'No description available.'}</p>
                <p class="card-text">
                  <span class="like-count text-danger" style="cursor:pointer;" data-post-id="${post.Post_ID}">
                    <i class="bi bi-heart"></i> ${post.LikeCount || 0}
                  </span>
                </p>
              </div>
            </div>
          `;
          container.appendChild(card);
        });

        // Attach like logic
        document.querySelectorAll('.like-count').forEach(span => {
          span.addEventListener('click', async (e) => {
            const postId = span.getAttribute('data-post-id');
            const token = localStorage.getItem('accessToken');
            if (!token) {
              alert('You must be logged in to like a post.');
              return;
            }
            try {
              const response = await fetch('/api/posts/likepost', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ post: postId })
              });
              const result = await response.json();
              if (response.ok) {
                // Optionally update the like count in the UI
                span.textContent = `Likes: ${result.newLikeCount}`;
              } else {
                alert(result.error || 'Error liking post');
              }
            } catch (err) {
              console.error('Fetch error:', err);
              alert('Network error or server is down.');
            }
          });
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

              // Attach edit logic
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = btn.getAttribute('data-post-id');
                // Find the post data from the DOM
                const card = btn.closest('.card');
                const title = card.querySelector('.card-title').textContent;
                const description = card.querySelector('.card-text:nth-of-type(3)').textContent;

                // Fill modal fields
                document.getElementById('editPostId').value = postId;
                document.getElementById('editPostTitle').value = title;
                document.getElementById('editPostDescription').value = description;

                // Show modal
                const editModal = new bootstrap.Modal(document.getElementById('editPostModal'));
                editModal.show();
            });
        });

      } else {
        console.error('No posts found.');
      }
    })
    .catch(err => {
      console.error('Error loading posts:', err);
    });

    // Handle edit form submit
    document.getElementById('editPostForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const postId = document.getElementById('editPostId').value;
        const title = document.getElementById('editPostTitle').value;
        const description = document.getElementById('editPostDescription').value;
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch('/api/posts/editpost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ post: postId, title, description })
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                window.location.reload();
            } else {
                alert(result.error || 'Error editing post');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            alert('Network error or server is down.');
        }
    });
});