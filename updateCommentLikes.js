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