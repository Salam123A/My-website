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