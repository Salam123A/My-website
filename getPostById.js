function getPostById(postId) {
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
        const postContent = postElement.querySelector('.post-content').innerHTML;
        const postDate = new Date(postElement.querySelector('p').textContent.replace('Posted on: ', '')).toISOString();
        const postLikes = parseInt(postElement.querySelector('.likes-count').textContent, 10);
        const comments = Array.from(postElement.querySelectorAll('.comment')).map(comment => ({
            id: parseInt(comment.querySelector('.comment-like-btn').dataset.id, 10),
            postId: parseInt(comment.querySelector('.comment-like-btn').dataset.postId, 10),
            username: comment.querySelector('strong').textContent.replace(':', ''),
            comment: comment.querySelector('p').nextSibling.textContent.trim(),
            date: new Date(comment.querySelector('small').textContent.replace('Posted on: ', '')).toISOString(),
            likes: parseInt(comment.querySelector('.comment-likes-count').textContent, 10)
        }));

        return {
            id: postId,
            content: postContent,
            date: postDate,
            likes: postLikes,
            comments: comments
        };
    }
    return null;
}