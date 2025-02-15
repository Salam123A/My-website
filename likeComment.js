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