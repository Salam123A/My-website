const socket = io();

document.addEventListener("DOMContentLoaded", function () {
    console.log('DOM fully loaded and parsed'); // Debugging statement

    const splitContainer = document.getElementById('splitContainer');
    const header = document.getElementById('header');
    const leftSide = document.getElementById('leftSide');

    splitContainer.classList.add('split');
    header.classList.add('split');
    leftSide.style.display = 'flex';

    // Check if the URL hash is in the format #post-<postId>
    const hash = window.location.hash;
    if (hash.startsWith('#post-')) {
        const postId = hash.split('-')[1];
        if (postId) {
            showPostInFullscreen(postId);
        }
    }
});

document.getElementById("postForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = sanitizeInput(document.getElementById("title").value.trim());
    const content = document.getElementById("content").value.trim();

    console.log('Post form submitted. Title:', title, 'Content:', content); // Debugging statement

    if (!title || !content) {
        alert('Please enter both title and content.');
        return;
    }
    if (title.length > 16) {
        alert('Title must be 16 characters or less.');
        return;
    }

    if (content.length > 240) {
        alert('Content must be 240 characters or less.');
        return;
    }

    try {
        const response = await fetch('/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });

        if (response.ok) {
            const newPost = await response.json();
            console.log('New post created:', newPost); // Debugging statement
            renderNewPost(newPost); // Automatically render the new post in the "newest posts" column
            renderPosts();
            document.getElementById("title").value = ''; // Clear the title input field
            document.getElementById("content").value = ''; // Clear the content input field
        } else {
            alert("Error adding post");
            console.error('Error adding post:', response.status); // Debugging statement
        }
    } catch (error) {
        alert("Error adding post");
        console.error('Error adding post:', error); // Debugging statement
    }
});

document.getElementById('toggleButton').addEventListener('click', () => {
    const splitContainer = document.getElementById('splitContainer');
    const header = document.getElementById('header');
    const leftSide = document.getElementById('leftSide');

    if (splitContainer.classList.contains('full-width')) {
        splitContainer.classList.remove('full-width');
        splitContainer.classList.add('split');
        header.classList.add('split');
        leftSide.style.display = 'flex';
        document.getElementById('fullscreenPostContainer').style.display = 'none';
        document.getElementById('splitContainer').style.display = 'flex';
        renderPosts();
    } else {
        splitContainer.classList.remove('split');
        splitContainer.classList.add('full-width');
        header.classList.remove('split');
        leftSide.style.display = 'none';
        document.getElementById('fullscreenPostContainer').style.display = 'none';
        document.getElementById('splitContainer').style.display = 'flex';
        renderPosts();
    }
    renderPosts();
});
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
// Function to render a post in fullscreen mode
function renderPostInFullscreen(postId) {
    const splitContainer = document.getElementById('splitContainer');
    const fullscreenPostContainer = document.getElementById('fullscreenPostContainer');
    const fullscreenPostContent = document.getElementById('fullscreenPostContent');

    // Hide all previously rendered posts
    document.querySelectorAll('.post').forEach(post => post.remove());

    // Hide split container
    splitContainer.style.display = 'none';

    // Show fullscreen post container
    fullscreenPostContainer.style.display = 'block';

    // Clear previous content
    fullscreenPostContent.innerHTML = '';
if (document.getElementById(`post-${postId}`)) {
    console.log('Post is already rendered');
    return;
}
    // Fetch the post data
    fetch(`/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            const div = document.createElement('div');
            div.className = 'post fullscreen-post';
            div.id = `post-${post.id}`;

            let content = `
                <button class="fullscreen-btn" data-id="${sanitizeInput(post.id.toString())}" style="background-color: lightblue; padding: 5px; border: none; border-radius: 5px; cursor: pointer; top: 5px; right: 5px;">⛶</button>
                <hr class="post-separator">
                <h3 class="post-title">${sanitizeHTML(post.title)}</h3>
                <div class="post-content">
                    ${convertLinksToEmbeds(sanitizeHTML(post.content))}
            `;

            // Process links for Twitter (X) embeds
            const links = post.content.match(/https?:\/\/[^\s]+/g) || [];
            links.forEach(link => {
                if (link.includes('x.com') || link.includes('twitter.com')) {
                    const tweetIdMatch = link.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[\w-]+\/status\/(\d+)(?:\/|$|\?|#)/);
                    if (tweetIdMatch) {
                        const tweetId = tweetIdMatch[1]; // Extract tweet ID
                        // Replace x.com with twitter.com for proper widget functionality
                        const tweetLink = link.replace('x.com', 'twitter.com');
                        content += `
                            <blockquote class="twitter-tweet" data-dnt="true" data-theme="dark">
                                <a href="${tweetLink}"></a>
                            </blockquote>
                        `;
                    }
                }
            });

            content += `
                </div>
                <hr class="post-separator">
                <div class="post-footer">
                    <p class="post-date">${new Date(post.date).toLocaleString()}</p>
                    <p class="post-likes-footer">Likes: <span class="likes-count">${sanitizeInput(post.likes.toString())}</span></p>
                </div>
                <div class="post-actions">
                    <button class="like-btn" data-id="${sanitizeInput(post.id.toString())}"><i class="fas fa-thumbs-up"></i> Like</button>
                    <button class="reply-btn" data-id="${sanitizeInput(post.id.toString())}" data-column-id="fullscreenPostContent"><i class="fas fa-reply"></i> Reply</button><br>
                    <button class="share-btn" data-id="${sanitizeInput(post.id.toString())}" data-column-id="fullscreenPostContent"><i class="fas fa-share"></i> Share on X</button>
                    <button class="toggle-comments-btn" data-id="${sanitizeInput(post.id.toString())}" data-container-id="fullscreenPostContent"><i class="fas fa-comments"></i> Hide/Show Comments</button>
                    <button class="delete-btn" data-id="${sanitizeInput(post.id.toString())}" style="background: none; border: none; color: red; font-size: 10px; cursor: pointer;">x</button>
                </div>
                <hr class="comment-separator">
                <div class="comments" id="comments-${sanitizeInput(post.id.toString())}-fullscreenPostContent" style="max-height: 300px; overflow-y: auto;">
                    ${renderCommentsHTML(post.comments)}
                </div>
                <hr class="comment-end-separator">
            `;

            div.innerHTML = content;
            fullscreenPostContent.appendChild(div);

            const deleteBtn = div.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => deletePost(post.id));
            }

            const fullscreenBtn = div.querySelector('.fullscreen-btn');
            if (fullscreenBtn) {
                fullscreenBtn.addEventListener('click', () => showPostInFullscreen(post.id));
            }

            const likeBtn = div.querySelector('.like-btn');
            if (likeBtn) {
                likeBtn.addEventListener('click', () => handleLike(post.id, 'fullscreenPostContent'));
            }

            const replyBtn = div.querySelector('.reply-btn');
            if (replyBtn) {
                replyBtn.addEventListener('click', () => handleReply(post.id, 'fullscreenPostContent'));
            }

            const toggleCommentsBtn = div.querySelector('.toggle-comments-btn');
            if (toggleCommentsBtn) {
                toggleCommentsBtn.addEventListener('click', () => handleToggleComments(post.id));
            }

            // Apply the shake and glow effect
            div.classList.add('shake-glow');
            setTimeout(() => {
                div.style.transition = 'opacity 0.5s';
                div.style.opacity = '1';
            }, 10);

            // Remove the effect after 1 second
            setTimeout(() => {
                div.classList.remove('shake-glow');
            }, 1470);
        })
        .catch(error => console.error('Error fetching post:', error));
}
function renderSearchResults(posts) {
    const postsContainer = document.getElementById('postsContainer');
    const searchResults = document.getElementById('searchResults');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const splitContainer = document.getElementById('splitContainer');
    const header = document.getElementById('header');
    const leftSide = document.getElementById('leftSide');

    splitContainer.classList.remove('split');
    splitContainer.classList.add('full-width');
    header.classList.remove('split');
    leftSide.style.display = 'none';
    document.getElementById('fullscreenPostContainer').style.display = 'none';
    document.getElementById('splitContainer').style.display = 'flex';

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
}
document.addEventListener('click', async function (e) {
    console.log('Click event detected:', e.target); // Debugging

    if (e.target.classList.contains('like-btn') || e.target.parentElement.classList.contains('like-btn')) {
        e.preventDefault();
        const postId = e.target.dataset.id || e.target.parentElement.dataset.id;
        console.log('Like post button clicked. Post ID:', postId); // Debugging

        await likePost(postId);
    } else if (e.target.classList.contains('reply-btn') || e.target.parentElement.classList.contains('reply-btn')) {
        e.preventDefault();
        const postId = e.target.dataset.id || e.target.parentElement.dataset.id;
        const columnId = e.target.dataset.columnId || e.target.parentElement.dataset.columnId; // Get the columnId
        console.log('Reply button clicked. Post ID:', postId, 'Column ID:', columnId); // Debugging

        if (e.target.closest('.fullscreen-post')) {
            toggleCommentFormSearchMode(postId); // Toggle comment form for search mode
        } else {
            toggleCommentForm(postId, columnId); // Pass columnId to toggleCommentForm
        }
    } else if (e.target.classList.contains('comment-like-btn')) {
        e.preventDefault();
        const commentDate = e.target.dataset.date;
        const postId = e.target.dataset.postId;
        console.log('Like comment button clicked. Post ID:', postId, 'Comment Date:', commentDate); // Debugging

        await likeComment(postId, commentDate); // Ensure the function is awaited
    } else if (e.target.classList.contains('sort-comments')) {
        e.preventDefault();
        const postId = e.target.dataset.id;
        const sortBy = e.target.dataset.sortBy;
        console.log('Sort comments button clicked. Post ID:', postId, 'Sort By:', sortBy); // Debugging

        sortComments(postId, sortBy);
    } else if (e.target.classList.contains('toggle-comments-btn')) {
        e.preventDefault();
        const postId = e.target.dataset.id;
        const containerId = e.target.dataset.containerId;
        console.log('Toggle comments button clicked. Post ID:', postId, 'Container ID:', containerId); // Debugging

        toggleComments(postId, containerId);
    } else if (e.target.classList.contains('share-btn')) {
        e.preventDefault();
        const postId = e.target.dataset.id;
        console.log('Share button clicked. Post ID:', postId); // Debugging

        sharePost(postId);
    } else if (e.target.classList.contains('comment-submit')) {
        const postId = e.target.dataset.id;
        const columnId = e.target.dataset.columnId;
        const username = e.target.previousElementSibling.previousElementSibling.value.trim();
        const commentContent = e.target.previousElementSibling.value.trim();

        if (username.length > 16) {
            alert('Username must be 16 characters or less.');
            return;
        }
        if (commentContent.length > 80) {
            alert('Comment must be 80 characters or less.');
            return;
        }

        if (username && commentContent) {
            await submitComment(postId, columnId, username, commentContent);
        } else {
            alert('Please enter both your name and a comment.');
        }
        e.preventDefault();
        console.log('Submit comment button clicked. Post ID:', postId, 'Column ID:', columnId, 'Username:', username, 'Comment:', commentContent); // Debugging
    } else if (e.target.id === 'searchButton') {
        e.preventDefault();
        const query = document.getElementById('searchInput').value.trim().toLowerCase();
        console.log('Search button clicked. Query:', query); // Debugging

        if (query) {
            await searchPosts(query);
        } else {
            window.location.href = '/';

        }
    }
});

// Listen for updates from the server
socket.on('updatePost', function (updatedPost) {
    console.log('UpdatePost event received. Updated Post:', updatedPost); // Debugging
    updatePostInAllColumns(updatedPost);
    updatePostInSearchMode(updatedPost);
    updatePostInFullscreen(updatedPost);
});

// Render new post with a shake and glow effect
async function renderNewPost(newPost) {
    const response = await fetch('/posts');
    const posts = await response.json();

    if (posts.some(post => post.id === newPost.id)) {
        const newestPostsContainer = document.getElementById('newestPosts');
        addPostToContainer(newPost, newestPostsContainer);

        // 7% chance to add to random posts
        if (Math.random() < 0.07) {
            const randomPostsContainer = document.getElementById('randomPosts');
            addPostToContainer(newPost, randomPostsContainer);
        }
    } else {
        console.warn('Post not found in posts.json:', newPost.id);
    }
}

async function addPostToContainer(post, container) {
    const postElement = document.createElement('div');
    postElement.id = `post-${post.id}`;
    postElement.className = 'post';
    postElement.innerHTML = `
        <h3>${sanitizeHTML(post.title)}</h3>
        <p>${sanitizeHTML(post.content)}</p>
        <button class="like-btn" data-id="${post.id}">Like</button>
        <button class="reply-btn" data-id="${post.id}" data-column-id="${container.id}">Reply</button>
        <button class="share-btn" data-id="${post.id}">Share</button>
    `;
    postElement.style.opacity = '0'; // Start with zero opacity
    container.insertBefore(postElement, container.firstChild);

    // Shake and glow effect
    postElement.classList.add('shake-glow');
    setTimeout(() => {
        postElement.style.transition = 'opacity 0.5s';
        postElement.style.opacity = '1';
    }, 10);

    // Remove the effect after 1 second
    setTimeout(() => {
        postElement.classList.remove('shake-glow');
    }, 1000);
}

// Initialize the page
renderPosts();

// Share post function
function sharePost(postId) {
    const postElement = document.getElementById(`post-${postId}`);
    const title = sanitizeHTML(postElement.querySelector('h3').innerText);
    const content = sanitizeHTML(postElement.querySelector('p').innerText);
    const url = new URL(window.location.href);
    url.hash = `#post-${postId}`;

    const shareText = `${title}\n\n${content}\n\n${url.toString()}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  
    // Open the twitter intent page in a new tab
    window.open(twitterUrl, '_blank');
}

// Function to show a post in fullscreen mode
async function showPostInFullscreen(postId) {
    try {
        const response = await fetch(`/posts/${postId}`);
        if (response.ok) {
            const post = await response.json();
            const fullscreenContainer = document.getElementById('fullscreenPostContainer');
            const splitContainer = document.getElementById('splitContainer');
            const header = document.getElementById('header');
            const leftSide = document.getElementById('leftSide');
			history.pushState(null, '', `/#post-${postId}`);
            splitContainer.classList.remove('split');
            splitContainer.classList.add('full-width');
            header.classList.remove('split');
            leftSide.style.display = 'none';

            renderPostInFullscreen(postId);
        } else {
            alert('Error loading post');
        }
    } catch (error) {
        console.error('Error loading post:', error); // Debugging statement
        alert('Error loading post');
    }
}



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
    const splitContainer = document.getElementById('splitContainer');
    const header = document.getElementById('header');
    const leftSide = document.getElementById('leftSide');

    splitContainer.classList.remove('split');
    splitContainer.classList.add('full-width');
    header.classList.remove('split');
    leftSide.style.display = 'none';
    document.getElementById('fullscreenPostContainer').style.display = 'none';
    document.getElementById('splitContainer').style.display = 'flex';

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

    // Attach event listeners for fullscreen buttons
    document.querySelectorAll('.fullscreen-btn').forEach(button => {
        button.addEventListener('click', function () {
            const postId = this.dataset.id;
            showPostInFullscreen(postId);
        });
    });
}

async function showPostInFullscreen(postId) {
    try {
        const response = await fetch(`/posts/${postId}`);
        if (response.ok) {
            const post = await response.json();
            const fullscreenContainer = document.getElementById('fullscreenPostContainer');
            const splitContainer = document.getElementById('splitContainer');
            const header = document.getElementById('header');
            const leftSide = document.getElementById('leftSide');
            history.pushState(null, '', `/#post-${postId}`);
            splitContainer.classList.remove('split');
            splitContainer.classList.add('full-width');
            header.classList.remove('split');
            leftSide.style.display = 'none';

            renderPostInFullscreen(postId);
        } else {
            alert('Error loading post');
        }
    } catch (error) {
        console.error('Error loading post:', error); // Debugging statement
        alert('Error loading post');
    }
}
// Function to render comments
async function renderComments(postId, containerId) {
    try {
        const response = await fetch(`/posts/${postId}/comments`);
        if (response.ok) {
            const comments = await response.json();
            const commentsContainer = document.getElementById(`comments-${postId}-${containerId}`);
            commentsContainer.innerHTML = renderCommentsHTML(comments);
        } else {
            alert('Error loading comments');
        }
    } catch (error) {
        console.error('Error loading comments:', error); // Debugging statement
        alert('Error loading comments');
    }
}




 