const socket = io();

document.addEventListener("DOMContentLoaded", function () {
  renderPosts();
});

document.getElementById("postForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const title = sanitizeInput(document.getElementById("title").value.trim());
  const content = document.getElementById("content").value.trim();

  if (!title || !content) {
    alert('Please enter both title and content.');
    return;
  }

  const response = await fetch('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, content })
  });

  if (response.ok) {
    const newPost = await response.json();
    renderNewPost(newPost); // Render the new post
    document.getElementById("title").value = ''; // Clear the title input field
    document.getElementById("content").value = ''; // Clear the content input field
  } else {
    alert("Error adding post");
  }
});

// Render all posts
async function renderPosts() {
  const response = await fetch('/posts');
  const posts = await response.json();
  const postsContainer = document.getElementById('posts-container');
  postsContainer.innerHTML = ''; // Clear existing posts

  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <p>Likes: ${post.likes}</p>
      <button class="like-btn" data-id="${post.id}">Like</button>
    `;
    postsContainer.appendChild(postElement);
  });
}

// Render a new post
function renderNewPost(post) {
  const postsContainer = document.getElementById('posts-container');
  const postElement = document.createElement('div');
  postElement.className = 'post';
  postElement.innerHTML = `
    <h3>${post.title}</h3>
    <p>${post.content}</p>
    <p>Likes: ${post.likes}</p>
    <button class="like-btn" data-id="${post.id}">Like</button>
  `;
  postsContainer.prepend(postElement); // Add the new post at the top
}

// Like a post
document.addEventListener('click', async function (e) {
  if (e.target.classList.contains('like-btn')) {
    const postId = e.target.dataset.id;
    const response = await fetch(`/posts/${postId}/like`, { method: 'POST' });

    if (response.ok) {
      const updatedPost = await response.json();
      renderPosts(); // Re-render posts to reflect the updated likes
    } else {
      alert('Error liking post');
    }
  }
});

// Listen for updates from the server
socket.on('updatePost', function (updatedPost) {
  renderPosts(); // Re-render posts when a post is updated
});
