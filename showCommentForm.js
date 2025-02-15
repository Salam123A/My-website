function showCommentForm(postId, columnId) {
    console.log(`showCommentForm called with postId: ${postId}, columnId: ${columnId}`); // Debugging line
    const postElement = document.querySelector(`#${columnId} #post-${postId}`);
    if (!postElement) {
        console.error('Post element not found'); // Debugging line
        return;
    }

    let commentForm = postElement.querySelector('.comment-form');
    if (!commentForm) {
        commentForm = document.createElement('div');
        commentForm.className = 'comment-form';
        commentForm.innerHTML = `
            <input type="text" class="comment-username" placeholder="Your name">
            <textarea class="comment-content" placeholder="Your comment"></textarea>
            <button class="submit-comment-btn" data-id="${postId}" data-column-id="${columnId}">Submit Comment</button>
        `;
        postElement.querySelector('.post-footer').insertAdjacentElement('afterend', commentForm);

        commentForm.querySelector('.submit-comment-btn').addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default form submission
            console.log('Submit Comment button clicked'); // Debugging line
            const username = commentForm.querySelector('.comment-username').value.trim();
            const comment = commentForm.querySelector('.comment-content').value.trim();
            if (username && comment) {
                addComment(postId, username, comment);
                commentForm.remove(); // Remove form after submission
            } else {
                alert('Please enter both username and comment.');
            }
        });
    } else {
        console.log('Comment form already exists'); // Debugging line
    }
}