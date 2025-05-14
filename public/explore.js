document.addEventListener('DOMContentLoaded', () => {
  // Fetch the username from the session
  fetch('/users/session')
    .then(res => res.json())
    .then(response => {
      if (response.UserName) {
        const userNameElement = document.getElementById('UserName');
        userNameElement.textContent = response.UserName; // Replace the text with the username
      } else {
        console.error('User not logged in');
      }
    })
    .catch(err => {
      console.error('Error fetching session data:', err);
    });
    
  fetch('/api/posts') // Fetch data from the backend API
    .then(res => res.json())
    .then(response => {
      if (response.data && response.data.length > 0) {
        const container = document.getElementById('posts-container');
        response.data.forEach(post => {
          const card = document.createElement('div');
          card.className = 'col-md-4';

          card.innerHTML = `
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title fw-bold">${post.Title}</h5>
                <p class="card-text ">By ${post.UserName}</p>
                <p class="card-text">Published on ${new Date(post.Created).toLocaleDateString()}</p>
                <p class="card-text">${post.Description || 'No description available.'}</p>
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