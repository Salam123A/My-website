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