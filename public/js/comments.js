function renderCommentsHTML(comments) {
    // Sort comments by likes (descending), then by date (descending)
    comments.sort((a, b) => {
        if (b.likes === a.likes) {
            return new Date(b.date) - new Date(a.date);
        }
        return b.likes - a.likes;
    });

    const isSplitMode = document.getElementById('splitContainer').classList.contains('split');

    return comments.map(comment => `
        <div class="comment-box" style="background: #2c2c2c; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
            <div class="comment" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="word-wrap: break-word; max-width: ${isSplitMode ? '172px' : '400px'};"><strong>${sanitizeHTML(comment.username)}:</strong> ${sanitizeHTML(comment.comment)}</p>
                    <p><small>${new Date(comment.date).toLocaleString()}</small></p>
                </div>
                <div style="text-align: right;">
                    <div class="like-container" style="display: flex; align-items: center; background-color: #007bff; color: #fff; padding: 3px 6px; border-radius: 3px;">
                        <button class="comment-like-btn" data-date="${comment.date}" data-post-id="${comment.postId}" style="background: none; border: none; color: #fff; margin-right: 5px;">
                            <i class="fas fa-thumbs-up"></i>
                        </button>
                        <span class="comment-likes-count">${comment.likes}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleCommentForm(postId, containerId) {
    const container = document.querySelector(`#${sanitizeInput(containerId)} #comments-${sanitizeInput(postId.toString())}-${sanitizeInput(containerId)}`);
    if (!container) return;

    let form = container.querySelector('.comment-form');
    if (form) {
        form.remove();
    } else {
        form = document.createElement('div');
        form.className = 'comment-form';
        form.style = `
            display: flex;
            flex-direction: column;
            background: #1e1e1e;
            padding: 10px;
            border: 1px solid #333;
            border-radius: 5px;
            margin-bottom: 10px;
        `;
        form.innerHTML = `
            <input type="text" class="comment-username" placeholder="Your Name" style="margin-bottom: 5px; padding: 5px; border: 1px solid #555; border-radius: 3px; background-color: #333; color: #fff;">
            <textarea class="comment-input" placeholder="Write a comment..." rows="2" style="margin-bottom: 5px; padding: 5px; border: 1px solid #555; border-radius: 3px; background-color: #333; color: #fff;"></textarea>
            <button class="comment-submit" data-id="${sanitizeInput(postId.toString())}" data-column-id="${sanitizeInput(containerId)}" style="padding: 5px; background-color: #444; color: #fff; border: none; border-radius: 3px;">Submit</button>
        `;
        container.insertBefore(form, container.firstChild);
    }
}

function toggleCommentFormSearchMode(postId) {
    const container = document.querySelector(`#searchResultsContainer #comments-${sanitizeInput(postId.toString())}-search`);
    if (!container) return;

    let form = container.querySelector('.comment-form');
    if (form) {
        form.remove();
    } else {
        form = document.createElement('div');
        form.className = 'comment-form';
        form.style = `
            display: flex;
            flex-direction: column;
            background: #1e1e1e;
            padding: 10px;
            border: 1px solid #333;
            border-radius: 5px;
            margin-bottom: 10px;
        `;
        form.innerHTML = `
            <input type="text" class="comment-username" placeholder="Your Name" style="margin-bottom: 5px; padding: 5px; border: 1px solid #555; border-radius: 3px; background-color: #333; color: #fff;">
            <textarea class="comment-input" placeholder="Write a comment..." rows="2" style="margin-bottom: 5px; padding: 5px; border: 1px solid #555; border-radius: 3px; background-color: #333; color: #fff;"></textarea>
            <button class="comment-submit" data-id="${sanitizeInput(postId.toString())}" data-column-id="searchResults" style="padding: 5px; background-color: #444; color: #fff; border: none; border-radius: 3px;">Submit</button>
        `;
        container.insertBefore(form, container.firstChild);
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

function sortAndRenderComments(postId, comments) {
    const commentsContainers = document.querySelectorAll(`#comments-${postId}`);
    commentsContainers.forEach(commentsContainer => {
        commentsContainer.innerHTML = renderCommentsHTML(comments);
    });
}
