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