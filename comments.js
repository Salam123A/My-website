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
            <p><small>${new Date(comment.date).toLocaleString()}</small></p>
        </div>
        <hr class="comment-separator">
    `).join('');
}

async function likeComment(postId, commentDate) {
    console.log('Like Comment - Post ID:', postId, 'Comment Date:', commentDate); // Debugging line

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
                render(); // Call render function after liking a comment
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
            render(); // Call render function after updating comment likes
        } else {
            console.error('Comment element not found');
        }
    } else {
        console.error('Comments container not found');
    }
}

async function addComment(postId, username, comment) {
    // Fetch user IP address
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const userIp = ipData.ip;

    console.log(`Reply added by user IP: ${userIp}, postId: ${postId}`); // Debugging line

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
        
        // Update the comments section for the specific post in all columns
        ['newestPosts', 'mostLikedPosts', 'randomPosts'].forEach(containerId => {
            const commentsContainer = document.getElementById(`comments-${postId}-${containerId}`);
            if (commentsContainer) {
                commentsContainer.innerHTML = renderCommentsHTML(updatedPost.comments);
            }
        });
        
        // Update the post in all columns
        updatePostInAllColumns(updatedPost);
    } else {
        alert('Failed to add comment.');
    }
}

function showCommentForm(postId, columnId) {
    const postElement = document.querySelector(`#${columnId} #post-${postId}`);
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
            <button class="submit-comment-btn" data-id="${postId}" data-column-id="${columnId}">Submit Comment</button>
        `;
        postElement.querySelector('.post-footer').insertAdjacentElement('afterend', commentForm);

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
    render(); // Call render function after sorting and rendering comments
}

// Assume render function is defined elsewhere
function render() {
    // Implementation of render function
}