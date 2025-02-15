async function searchPosts(query) {
    try {
        const response = await fetch(`/posts`);
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        const posts = await response.json();
        const results = posts.filter(post => post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query));
        renderSearchResults(results);
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function renderSearchResults(posts) {
    const postsContainer = document.getElementById('postsContainer');
    const searchResults = document.getElementById('searchResults');
    const searchResultsContainer = document.getElementById('searchResultsContainer');

    // Remove all other containers and posts
    postsContainer.remove();
    const otherContainers = document.querySelectorAll('#newestPosts, #mostLikedPosts, #randomPosts');
    otherContainers.forEach(container => container.remove());

    searchResults.style.display = 'block';
    searchResultsContainer.innerHTML = '';

    const renderedPostIds = new Set(); // Keep track of rendered post IDs

    posts.forEach(post => {
        if (!renderedPostIds.has(post.id)) { // Check if the post ID has already been rendered
            const div = document.createElement('div');
            div.className = 'post fullscreen-post';
            div.id = `post-${post.id}-search`;

            div.innerHTML = `
                <h3 class="post-title">${sanitizeHTML(post.title)}</h3>
                <div class="post-content">
                    ${convertLinksToEmbeds(sanitizeHTML(post.content))}
                </div>
                <hr class="post-separator">
                <div class="post-footer">
                    <p class="post-date">${new Date(post.date).toLocaleString()}</p>
                    <button class="fullscreen-btn" data-id="${sanitizeInput(post.id.toString())}" style="background-color: lightblue; padding: 5px; border: none; border-radius: 5px; cursor: pointer; top: 5px; right: 5px;">⛶</button>
                    <p class="post-likes-footer">Likes: <span class="likes-count">${sanitizeInput(post.likes.toString())}</span></p>
                </div>
                <div class="post-actions">
                    <button class="like-btn" data-id="${sanitizeInput(post.id.toString())}"><i class="fas fa-thumbs-up"></i> Like</button>
                    <button class="reply-btn" data-id="${sanitizeInput(post.id.toString())}" data-column-id="searchResults"><i class="fas fa-reply"></i> Reply</button>
                </div>
                <hr class="comment-separator">
                <div class="comments" id="comments-${sanitizeInput(post.id.toString())}-search" style="max-height: 300px; overflow-y: auto;">
                    ${renderCommentsHTML(post.comments)}
                </div>
            `;

            searchResultsContainer.appendChild(div);
            renderedPostIds.add(post.id); // Add the post ID to the set
        }
    });

    attachEventListeners(); // Ensure event listeners are attached to the new elements

    // Attach event listeners for fullscreen buttons
    document.querySelectorAll('.fullscreen-btn').forEach(button => {
        button.addEventListener('click', function () {
            const postId = this.dataset.id;
            showPostInFullscreen(postId);
        });
    });
}

function attachEventListeners() {
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const postId = this.dataset.id;
            await likePost(postId);
        });
    });

    document.querySelectorAll('.reply-btn').forEach(button => {
        button.addEventListener('click', function () {
            const postId = this.dataset.id;
            const columnId = this.dataset.columnId;
            toggleCommentForm(postId, columnId);
        });
    });
}

// Assuming the functions sanitizeHTML, sanitizeInput, convertLinksToEmbeds, renderCommentsHTML, likePost, toggleCommentForm, and showPostInFullscreen are defined elsewhere in your code.