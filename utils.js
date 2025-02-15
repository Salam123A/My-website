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

function toggleComments(postId, containerId) {
    const commentsContainer = document.getElementById(`comments-${postId}-${containerId}`);
    if (commentsContainer) {
        if (commentsContainer.style.display === 'none') {
            commentsContainer.style.display = 'block';
        } else {
            commentsContainer.style.display = 'none';
        }
        render(); // Call render function after toggling comments
    }
}

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
        render(); // Call render function after sharing the post
    }
}

// Assume render function is defined elsewhere
function render() {
    // Implementation of render function
}