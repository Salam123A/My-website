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