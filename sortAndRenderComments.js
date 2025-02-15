function sortAndRenderComments(postId, comments) {
    const commentsContainers = document.querySelectorAll(`#comments-${postId}`);
    commentsContainers.forEach(commentsContainer => {
        commentsContainer.innerHTML = `
            <div class="sort-buttons">
                <button class="sort-comments" data-id="${postId}" data-sort-by="newest">Sort by Newest</button>
                <button class="sort-comments" data-id="${postId}" data-sort-by="mostLiked">Sort by Most Liked</button>
            </div>
            ${renderCommentsHTML(comments)}
        `;
    });
}