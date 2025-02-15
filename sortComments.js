function sortComments(postId, sortBy) {
    const post = getPostById(postId);
    if (post) {
        renderComments(postId, post.comments, sortBy);
    }
}