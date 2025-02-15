function renderPostColumn(posts, container) {
    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post';
        div.id = `post-${post.id}`;

        div.innerHTML = `
            <h3>${sanitizeHTML(post.title)}</h3>
            <div class="post-content" data-id="${post.id}">${sanitizeHTML(post.content)}</div>
            <p>Posted on: ${new Date(post.date).toLocaleString()}</p>
            <p>Likes: <span class="likes-count">${post.likes}</span></p>
            <button class="like-btn" data-id="${post.id}"><i class="fas fa-thumbs-up"></i></button>
            <button class="reply-btn" data-id="${post.id}"><i class="fas fa-reply"></i> Reply</button>
            <div class="sort-buttons">
                <button class="toggle-comments-btn" data-id="${post.id}" data-container-id="${container.id}"><i class="fas fa-comments"></i> Hide/Show Comments</button>
                <button class="share-btn" data-id="${post.id}" data-container-id="${container.id}"><i class="fas fa-share"></i> Share on X</button>
            </div>
            <div class="comments" id="comments-${post.id}-${container.id}" style="max-height: 300px; overflow-y: auto;">
                ${renderCommentsHTML(post.comments)}
            </div>
        `;
        container.appendChild(div);
    });
}