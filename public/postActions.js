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

async function likePost(postId) {
    try {
        const response = await fetch(`/posts/${postId}/like`, { method: 'POST' });

        if (response.ok) {
            const updatedPost = await response.json();
            console.log('Post liked:', updatedPost); // Debugging

            // Check if the post is in fullscreen mode
            const fullscreenPostContainer = document.getElementById('fullscreenPostContainer');
            if (fullscreenPostContainer && fullscreenPostContainer.style.display === 'block') {
                // Update the post in fullscreen mode
                showPostInFullscreen(postId);
            } else {
                // Update the post in all columns and search mode
                updatePostInAllColumns(updatedPost);
                updatePostInSearchMode(updatedPost);
            }
        } else {
            console.error('Failed to like post:', response.status);
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

function handleReply(postId, columnId) {
    // Toggle comment form
       if (columnId === 'fullscreenPostContent')
	toggleCommentForm(postId, columnId);
	    // Toggle comment form
      
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
	
	toggleCommentForm(postId, columnId);
	
}

function handleToggleComments(postId) {
    const commentsContainer = document.getElementById(`comments-${sanitizeInput(postId.toString())}`);
    if (commentsContainer) {
        commentsContainer.style.display = commentsContainer.style.display === 'none' ? 'block' : 'none';
    }
}

async function likeComment(postId, commentDate) {
    try {
        const response = await fetch(`/posts/${postId}/comments/date/${commentDate}/like`, { method: 'POST' });

        if (response.ok) {
            const updatedPost = await response.json();
            console.log('Comment liked:', updatedPost); // Debugging

            // Check if the post is in fullscreen mode
            const fullscreenPostContainer = document.getElementById('fullscreenPostContainer');
            if (fullscreenPostContainer && fullscreenPostContainer.style.display === 'block') {
                // Update the post in fullscreen mode
                showPostInFullscreen(postId);
            } else {
                // Update the post in all columns and search mode
                updatePostInAllColumns(updatedPost);
                updatePostInSearchMode(updatedPost);
            }
        } else {
            console.error('Failed to like comment:', response.status);
        }
    } catch (error) {
        console.error('Error liking comment:', error);
    }
}

async function addComment(postId, username, comment) {
    try {
        const response = await fetch(`/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, comment })
        });

        if (response.ok) {
            const updatedPost = await response.json();
            console.log('Comment added:', updatedPost); // Debugging

            // Check if the post is in fullscreen mode
            const fullscreenPostContainer = document.getElementById('fullscreenPostContainer');
            if (fullscreenPostContainer && fullscreenPostContainer.style.display === 'block') {
                // Update the post in fullscreen mode
                showPostInFullscreen(postId);
            } else {
                // Update the post in all columns and search mode
                updatePostInAllColumns(updatedPost);
                updatePostInSearchMode(updatedPost);
            }
        } else {
            alert('Failed to add comment.');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}

async function submitComment(postId, columnId, username, commentContent) {
    try {
        const response = await fetch(`/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, comment: commentContent })
        });

        if (response.ok) {
            const updatedPost = await response.json();
            console.log('Comment submitted:', updatedPost); // Debugging

            // Check if the post is in fullscreen mode
            const fullscreenPostContainer = document.getElementById('fullscreenPostContainer');
            if (fullscreenPostContainer && fullscreenPostContainer.style.display === 'block') {
                // Update the post in fullscreen mode
					updatePostInFullscreen(updatedPost);
            
                // Update the post in all columns and search mode
                updatePostInAllColumns(updatedPost);
                updatePostInSearchMode(updatedPost);
            }
        } else {
            console.error('Failed to submit comment:', response.status);
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
	
}

async function renderNewPost(newPost) {
    // Implement the logic to render the new post in the appropriate section
    // This function should update the DOM to reflect the newly created post
    console.log('Rendering new post:', newPost); // Debugging statement
    // Add your rendering logic here
}