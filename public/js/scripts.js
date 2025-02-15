document.addEventListener("DOMContentLoaded", function() {
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
        renderNewPost(newPost); // Automatically render the new post in the "newest posts" column
        document.getElementById("title").value = ''; // Clear the title input field
        document.getElementById("content").value = ''; // Clear the content input field
    } else {
        alert("Error adding post");
    }
});

async function fetchPosts() {
    try {
        const response = await fetch('/posts');
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('like-btn') || e.target.parentElement.classList.contains('like-btn')) {
        e.preventDefault();
        const postId = e.target.dataset.id || e.target.parentElement.dataset.id;
        likePost(postId);
    } else if (e.target.classList.contains('reply-btn') || e.target.parentElement.classList.contains('reply-btn')) {
        e.preventDefault();
        const postId = e.target.dataset.id || e.target.parentElement.dataset.id;
        showCommentForm(postId);
    } else if (e.target.classList.contains('comment-like-btn')) {
        e.preventDefault();
        const commentDate = e.target.dataset.date;
        const postId = e.target.dataset.postId;
        likeComment(postId, commentDate);
    } else if (e.target.classList.contains('sort-comments')) {
        e.preventDefault();
        const postId = e.target.dataset.id;
        const sortBy = e.target.dataset.sortBy;
        sortComments(postId, sortBy);
    } else if (e.target.classList.contains('toggle-comments-btn')) {
        e.preventDefault();
        const postId = e.target.dataset.id;
        const containerId = e.target.dataset.containerId;
        toggleComments(postId, containerId);
    } else if (e.target.classList.contains('share-btn')) {
        e.preventDefault();
        const postId = e.target.dataset.id;
        sharePost(postId);
    }
});

async function likePost(postId) {
    const response = await fetch(`/posts/${postId}/like`, { method: 'POST' });
    if (response.ok) {
        const updatedPost = await response.json();
        updatePostLikes(postId, updatedPost.likes);
        updatePostInAllColumns(updatedPost);
    } else {
        alert('Failed to like post.');
    }
}

async function likeComment(postId, commentDate) {
    console.log('Like Comment - Post ID:', postId, 'Commen1t Date:', commentDate); // Debugging line

    if (isNaN(postId)) {
        console.error('Invalid postId:', postId);
        alert('Invalid post ID. Please try again.');
        return;
    }

    try {
        const response = await fetch(`/posts/${postId}/comments/date/${commentDate}/like`, { method: 'POST' });
        
        if (response.ok) {
            const updatedPost = await response.json();
            const updatedComment = updatedPost.comments.find(comment => comment.date === commentDate);
            if (updatedComment) {
                updateCommentLikes(postId, commentDate, updatedComment.likes);
                sortAndRenderComments(postId, updatedPost.comments);
                updatePostInAllColumns(updatedPost);
            } else {
                console.error('Updated comment not found');
            }
        } else {
            console.error('Failed to like comment:', response.status);
        }
    } catch (error) {
        console.error('Error liking comment:', error);
    }
}

function updateCommentLikes(postId, commentDate, newLikes) {
    console.log('Updating comment likes:', postId, commentDate, newLikes); // Debugging line

    const commentsContainer = document.getElementById(`comments-${postId}`);
    if (commentsContainer) {
        const commentElement = commentsContainer.querySelector(`.comment-like-btn[data-date="${commentDate}"]`);
        if (commentElement) {
            const likesCountElement = commentElement.parentElement.querySelector('.comment-likes-count');
            if (likesCountElement) {
                likesCountElement.textContent = newLikes;
            } else {
                console.error('Likes count element not found');
            }
        } else {
            console.error('Comment element not found');
        }
    } else {
        console.error('Comments container not found');
    }
}

async function addComment(postId, username, comment) {
    const response = await fetch(`/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, comment })
    });
    if (response.ok) {
        const updatedPost = await response.json();
        console.log('Updated Post:', updatedPost); // Debugging line
        renderUpdatedPost(updatedPost); // Reload the post in the user interface
        updatePostInAllColumns(updatedPost);
    } else {
        alert('Failed to add comment.');
    }
}

async function renderPosts() {
    console.log('Starting renderPosts');
    const posts = await fetchPosts();
    console.log('Posts fetched:', posts);
    if (!posts || posts.length === 0) {
        console.error('No posts found or failed to fetch posts.');
        return;
    }

    const newestPostsContainer = document.getElementById('newestPosts');
    const mostLikedPostsContainer = document.getElementById('mostLikedPosts');
    const randomPostsContainer = document.getElementById('randomPosts');

    newestPostsContainer.innerHTML = '';
    mostLikedPostsContainer.innerHTML = '';
    randomPostsContainer.innerHTML = '';

    const newestPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    const mostLikedPosts = [...posts].sort((a, b) => b.likes - a.likes);
    const randomPosts = [...posts].sort(() => Math.random() - 0.5);

    lazyLoadPosts(newestPosts, newestPostsContainer);
    lazyLoadPosts(mostLikedPosts, mostLikedPostsContainer);
    lazyLoadPosts(randomPosts, randomPostsContainer);
}

function lazyLoadPosts(posts, container) {
    let loadedPosts = 0;
    const postsPerLoad = 5;

    function loadMorePosts() {
        const end = loadedPosts + postsPerLoad;
        const postsToLoad = posts.slice(loadedPosts, end);
        renderPostColumn(postsToLoad, container);
        loadedPosts += postsPerLoad;

        if (loadedPosts >= posts.length) {
            container.removeEventListener('scroll', onScroll);
        }
    }

    function onScroll() {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
            loadMorePosts();
        }
    }

    container.addEventListener('scroll', onScroll);
    loadMorePosts();
}

function renderPostColumn(posts, container) {
    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post';
        div.id = `post-${post.id}`;

        div.innerHTML = `
            <h3>${sanitizeHTML(post.title)}</h3>
            <div class="post-content" data-id="${post.id}">${sanitizeHTML(post.content)}</div>
            <p>Posted on: ${new Date(post.date).toLocaleString()}</p>
            <p>Likes: <span class="likes-count">${post.likes}</span></p>
            <button class="like-btn" data-id="${post.id}"><i class="fas fa-thumbs-up"></i></button>
            <button class="reply-btn" data-id="${post.id}"><i class="fas fa-reply"></i> Reply</button>
            <div class="sort-buttons">
                <button class="toggle-comments-btn" data-id="${post.id}" data-container-id="${container.id}"><i class="fas fa-comments"></i> Hide/Show Comments</button>
                <button class="share-btn" data-id="${post.id}" data-container-id="${container.id}"><i class="fas fa-share"></i> Share on X</button>
            </div>
            <div class="comments" id="comments-${post.id}-${container.id}" style="max-height: 300px; overflow-y: auto;">
                ${renderCommentsHTML(post.comments)}
            </div>
        `;
        container.appendChild(div);
    });
}

function renderCommentsHTML(comments) {
    // Sort comments by likes (descending), then by date (descending)
    comments.sort((a, b) => {
        if (b.likes === a.likes) {
            return new Date(b.date) - new Date(a.date);
        }
        return b.likes - a.likes;
    });

    return comments.map(comment => `
        <div class="comment">
            <p><strong>${sanitizeHTML(comment.username)}:</strong> ${sanitizeHTML(comment.comment)}</p>
            <p>Likes: <span class="comment-likes-count">${comment.likes}</span></p>
            <button class="comment-like-btn" data-date="${comment.date}" data-post-id="${comment.postId}">
                <i class="fas fa-thumbs-up"></i>
            </button>
            <p><small>Posted on: ${new Date(comment.date).toLocaleString()}</small></p>
        </div>
    `).join('<hr>');
}

function sortComments(postId, sortBy) {
    const post = getPostById(postId);
    if (post) {
        renderComments(postId, post.comments, sortBy);
    }
}

function getPostById(postId) {
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
        const postContent = postElement.querySelector('.post-content').innerHTML;
        const postDate = new Date(postElement.querySelector('p').textContent.replace('Posted on: ', '')).toISOString();
        const postLikes = parseInt(postElement.querySelector('.likes-count').textContent, 10);
        const comments = Array.from(postElement.querySelectorAll('.comment')).map(comment => ({
            id: parseInt(comment.querySelector('.comment-like-btn').dataset.id, 10),
            postId: parseInt(comment.querySelector('.comment-like-btn').dataset.postId, 10),
            username: comment.querySelector('strong').textContent.replace(':', ''),
            comment: comment.querySelector('p').nextSibling.textContent.trim(),
            date: new Date(comment.querySelector('small').textContent.replace('Posted on: ', '')).toISOString(),
            likes: parseInt(comment.querySelector('.comment-likes-count').textContent, 10)
        }));

        return {
            id: postId,
            content: postContent,
            date: postDate,
            likes: postLikes,
            comments: comments
        };
    }
    return null;
}

function updatePostLikes(postId, newLikes) {
    ['newestPosts', 'mostLikedPosts', 'randomPosts'].forEach(containerId => {
        const postElement = document.getElementById(containerId).querySelector(`#post-${postId}`);
        if (postElement) {
            const likesCountElement = postElement.querySelector('.likes-count');
            if (likesCountElement) {
                likesCountElement.textContent = newLikes;
            }
        }
    });
}

function sanitizeInput(input) {
    const element = document.createElement('div');
    element.innerText = input;
    return element.innerHTML;
}

function sanitizeHTML(html) {
    const element = document.createElement('div');
    element.innerHTML = html;
    return element.textContent || element.innerText;
}

// Function to render a new post in the "newest posts" column
function renderNewPost(post) {
    const newestPostsContainer = document.getElementById('newestPosts');
    const div = document.createElement('div');
    div.className = 'post';
    div.id = `post-${post.id}`;

    div.innerHTML = `
        <h3>${sanitizeHTML(post.title)}</h3>
        <div class="post-content" data-id="${post.id}">${sanitizeHTML(post.content)}</div>
        <p>Posted on: ${new Date(post.date).toLocaleString()}</p>
        <p>Likes: <span class="likes-count">${post.likes}</span></p>
        <button class="like-btn" data-id="${post.id}"><i class="fas fa-thumbs-up"></i></button>
        <button class="reply-btn" data-id="${post.id}"><i class="fas fa-reply"></i> Reply</button>
        <div class="sort-buttons">
            <button class="toggle-comments-btn" data-id="${post.id}" data-container-id="newestPosts"><i class="fas fa-comments"></i> Hide/Show Comments</button>
            <button class="share-btn" data-id="${post.id}" data-container-id="newestPosts"><i class="fas fa-share"></i> Share on X</button>
        </div>
        <div class="comments" id="comments-${post.id}-newestPosts" style="max-height: 300px; overflow-y: auto;">
            ${renderCommentsHTML(post.comments)}
        </div>
    `;
    newestPostsContainer.prepend(div); // Add the new post to the top of the column
}

// Function to render an updated post in all columns
function renderUpdatedPost(updatedPost) {
    updatePostInAllColumns(updatedPost);
}

// Function to sort and render comments for a post
function sortAndRenderComments(postId, comments) {
    const commentsContainers = document.querySelectorAll(`#comments-${postId}`);
    commentsContainers.forEach(commentsContainer => {
        commentsContainer.innerHTML = `
            <div class="sort-buttons">
                <button class="sort-comments" data-id="${postId}" data-sort-by="newest">Sort by Newest</button>
                <button class="sort-comments" data-id="${postId}" data-sort-by="mostLiked">Sort by Most Liked</button>
            </div>
            ${renderCommentsHTML(comments)}
        `;
    });
}

// Function to show the comment form when the reply button is pressed
function showCommentForm(postId) {
    const postElement = document.getElementById(`post-${postId}`);
    if (!postElement) {
        console.error('Post element not found');
        return;
    }

    let commentForm = postElement.querySelector('.comment-form');
    if (!commentForm) {
        commentForm = document.createElement('div');
        commentForm.className = 'comment-form';
        commentForm.innerHTML = `
            <input type="text" class="comment-username" placeholder="Your name">
            <textarea class="comment-content" placeholder="Your comment"></textarea>
            <button class="submit-comment-btn" data-id="${postId}">Submit Comment</button>
        `;
        postElement.appendChild(commentForm);

        commentForm.querySelector('.submit-comment-btn').addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default form submission
            const username = commentForm.querySelector('.comment-username').value.trim();
            const comment = commentForm.querySelector('.comment-content').value.trim();
            if (username && comment) {
                addComment(postId, username, comment);
                commentForm.remove(); // Remove form after submission
            } else {
                alert('Please enter both username and comment.');
            }
        });
    }
}

// Function to update a post in all columns where it is displayed
function updatePostInAllColumns(updatedPost) {
    ['newestPosts', 'mostLikedPosts', 'randomPosts'].forEach(containerId => {
        const postElement = document.getElementById(containerId).querySelector(`#post-${updatedPost.id}`);
        if (postElement) {
            postElement.outerHTML = `
                <div class="post" id="post-${updatedPost.id}">
                    <h3>${sanitizeHTML(updatedPost.title)}</h3>
                    <div class="post-content" data-id="${updatedPost.id}">${sanitizeHTML(updatedPost.content)}</div>
                    <p>Posted on: ${new Date(updatedPost.date).toLocaleString()}</p>
                    <p>Likes: <span class="likes-count">${updatedPost.likes}</span></p>
                    <button class="like-btn" data-id="${updatedPost.id}"><i class="fas fa-thumbs-up"></i></button>
                    <button class="reply-btn" data-id="${updatedPost.id}"><i class="fas fa-reply"></i> Reply</button>
                    <div class="sort-buttons">
                        <button class="toggle-comments-btn" data-id="${updatedPost.id}" data-container-id="${containerId}"><i class="fas fa-comments"></i> Hide/Show Comments</button>
                        <button class="share-btn" data-id="${updatedPost.id}" data-container-id="${containerId}"><i class="fas fa-share"></i> Share on X</button>
                    </div>
                    <div class="comments" id="comments-${updatedPost.id}-${containerId}" style="max-height: 300px; overflow-y: auto;">
                        ${renderCommentsHTML(updatedPost.comments)}
                    </div>
                </div>
            `;
        }
    });
}

// Function to toggle the visibility of the comments section
function toggleComments(postId, containerId) {
    const commentsContainer = document.getElementById(`comments-${postId}-${containerId}`);
    if (commentsContainer) {
        if (commentsContainer.style.display === 'none') {
            commentsContainer.style.display = 'block';
        } else {
            commentsContainer.style.display = 'none';
        }
    }
}

// Function to share the post on X
function sharePost(postId) {
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
        const postTitle = postElement.querySelector('h3').textContent;
        const postContent = postElement.querySelector('.post-content').textContent;
        const containerId = postElement.querySelector('.sort-buttons .share-btn').dataset.containerId;
        const containerElement = document.getElementById(containerId);
        const containerStyle = window.getComputedStyle(containerElement);
        const formattedContent = `Title: ${postTitle}\nContent: ${postContent}\nContainer Style: ${containerStyle.cssText}`;
        const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(formattedContent)}`;
        window.open(shareUrl, '_blank');
    }
}
// Initialize the page
renderPosts();