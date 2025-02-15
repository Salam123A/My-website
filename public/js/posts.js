async function fetchPosts() {
    try {
        const response = await fetch('/posts');
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

async function renderPosts() {
    const posts = await fetchPosts();
    if (!posts || posts.length === 0) {
        console.error('No posts found or failed to fetch posts.');
        return;
    }

    const newestPostsContainer = document.getElementById('newestPosts');
    const mostLikedPostsContainer = document.getElementById('mostLikedPosts');
    const randomPostsContainer = document.getElementById('randomPosts');

    newestPostsContainer.innerHTML = '';
    mostLikedPostsContainer.innerHTML = '';
    randomPostsContainer.innerHTML = '';

    const newestPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    const mostLikedPosts = [...posts].sort((a, b) => b.likes - a.likes);
    const randomPosts = [...posts].sort(() => Math.random() - 0.5);

    lazyLoadPosts(newestPosts, newestPostsContainer);
    lazyLoadPosts(mostLikedPosts, mostLikedPostsContainer);
    lazyLoadPosts(randomPosts, randomPostsContainer);
}

function lazyLoadPosts(posts, container) {
    let loadedPosts = 0;
    const postsPerLoad = 2;

    function loadMorePosts() {
        const end = loadedPosts + postsPerLoad;
        const postsToLoad = posts.slice(loadedPosts, end);
        renderPostColumn(postsToLoad, container);
        loadedPosts += postsPerLoad;

        const loadMoreBtn = container.querySelector('.load-more-btn');
        if (loadedPosts >= posts.length) {
            if (loadMoreBtn) {
                loadMoreBtn.remove();
            }
        } else {
            if (loadMoreBtn) {
                loadMoreBtn.remove();
            }
            addLoadMoreButton(container);
        }
    }

    function addLoadMoreButton(container) {
        let loadMoreBtn = container.querySelector('.load-more-btn');
        if (!loadMoreBtn) {
            loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn';
            loadMoreBtn.textContent = 'Show More...';
            loadMoreBtn.addEventListener('click', loadMorePosts);
            container.appendChild(loadMoreBtn);
        }
    }

    loadMorePosts();
}

function renderPostColumn(posts, container) {
    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post';
        div.id = `post-${post.id}`;

        let content = `
            <hr class="post-separator">
            <h3 class="post-title">${sanitizeHTML(post.title)}</h3>
            <div class="post-content">
                ${convertLinksToEmbeds(sanitizeHTML(post.content))}
        `;

        // Process links for Twitter (X) embeds
        const links = post.content.match(/https?:\/\/[^\s]+/g) || [];
        links.forEach(link => {
            if (link.includes('x.com') || link.includes('twitter.com')) {
                const tweetIdMatch = link.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[\w-]+\/status\/(\d+)(?:\/|$|\?|#)/);
                if (tweetIdMatch) {
                    const tweetId = tweetIdMatch[1]; // Extract tweet ID
                    // Replace x.com with twitter.com for proper widget functionality
                    const tweetLink = link.replace('x.com', 'twitter.com');
                    content += `
                        <blockquote class="twitter-tweet" data-dnt="true" data-theme="dark">
                            <a href="${tweetLink}"></a>
                        </blockquote>
                    `;
                }
            }
        });

        content += `
            </div>
            <hr class="post-separator">
            <div class="post-footer">
                <p class="post-date">${new Date(post.date).toLocaleString()}</p>
                <p class="post-likes-footer">Likes: <span class="likes-count">${sanitizeInput(post.likes.toString())}</span></p>
            </div>
            <div class="post-actions">
                <button class="like-btn" data-id="${sanitizeInput(post.id.toString())}"><i class="fas fa-thumbs-up"></i> Like</button>
                <button class="reply-btn" data-id="${sanitizeInput(post.id.toString())}" data-column-id="${sanitizeInput(container.id)}"><i class="fas fa-reply"></i> Reply</button>
                <button class="toggle-comments-btn" data-id="${sanitizeInput(post.id.toString())}" data-container-id="${sanitizeInput(container.id)}"><i class="fas fa-comments"></i> Hide/Show Comments</button>
                <button class="share-btn" data-id="${sanitizeInput(post.id.toString())}" data-container-id="${sanitizeInput(container.id)}"><i class="fas fa-share"></i> Share on X</button>
                <button class="delete-btn" data-id="${sanitizeInput(post.id.toString())}"><i class="fas fa-trash"></i> Delete</button>
            </div>
            <hr class="comment-separator">
            <div class="comments" id="comments-${sanitizeInput(post.id.toString())}-${sanitizeInput(container.id)}" style="max-height: 300px; overflow-y: auto;">
                ${renderCommentsHTML(post.comments)}
            </div>
            <hr class="comment-end-separator">
        `;

        div.innerHTML = content;
        container.appendChild(div);

        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deletePost(post.id));
    });

    // Load Twitter (X) widgets after rendering the posts
    if (typeof twttr !== 'undefined') {
        twttr.widgets.load();
    }
    // Load Twitter widgets.js script to render embedded tweets
    const script = document.createElement('script');
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.head.appendChild(script);
}

function renderNewPost(post) {
    const newestPostsContainer = document.getElementById('newestPosts');
    const div = document.createElement('div');
    div.className = 'post';
    div.id = `post-${post.id}`;

    div.innerHTML = `
        <h3 class="post-title">${sanitizeHTML(post.title)}</h3>
        <div class="post-content">
            ${convertLinksToEmbeds(sanitizeHTML(post.content))}
        </div>
        <hr class="post-separator">
        <div class="post-footer">
            <p class="post-date">${new Date(post.date).toLocaleString()}</p>
            <p class="post-likes-footer">Likes: <span class="likes-count">${sanitizeInput(post.likes.toString())}</span></p>
        </div>
        <div class="post-actions">
            <button class="like-btn" data-id="${sanitizeInput(post.id.toString())}"><i class="fas fa-thumbs-up"></i> Like</button>
            <button class="reply-btn" data-id="${sanitizeInput(post.id.toString())}" data-column-id="newestPosts"><i class="fas fa-reply"></i> Reply</button>
            <button class="toggle-comments-btn" data-id="${sanitizeInput(post.id.toString())}" data-container-id="newestPosts"><i class="fas fa-comments"></i> Hide/Show Comments</button>
            <button class="share-btn" data-id="${sanitizeInput(post.id.toString())}" data-container-id="newestPosts"><i class="fas fa-share"></i> Share on X</button>
            <button class="delete-btn" data-id="${sanitizeInput(post.id.toString())}"><i class="fas fa-trash"></i> Delete</button>
        </div>
        <hr class="comment-separator">
        <div class="comments" id="comments-${sanitizeInput(post.id.toString())}-newestPosts" style="max-height: 300px; overflow-y: auto;">
            ${renderCommentsHTML(post.comments)}
        </div>
        <hr class="comment-end-separator">
    `;
    newestPostsContainer.prepend(div); // Add the new post to the top of the column

    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deletePost(post.id));

    // Load Twitter widgets.js script to render embedded tweets
    const script = document.createElement('script');
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.head.appendChild(script);
}

function updatePostInAllColumns(updatedPost) {
    ['newestPosts', 'mostLikedPosts', 'randomPosts'].forEach(containerId => {
        const postElement = document.getElementById(containerId).querySelector(`#post-${sanitizeInput(updatedPost.id.toString())}`);
        if (postElement) {
            const postFooter = postElement.querySelector('.post-footer');
            const postLikesFooter = postFooter.querySelector('.post-likes-footer span');
            postLikesFooter.textContent = sanitizeInput(updatedPost.likes.toString());

            const commentsContainer = postElement.querySelector('.comments');
            if (commentsContainer) {
                commentsContainer.innerHTML = renderCommentsHTML(updatedPost.comments);
            }
        }
    });
}

async function likePost(postId) {
    try {
        const token = localStorage.getItem('token'); // Get the stored JWT token
        console.log('Like button pressed'); // Log to indicate the function is called
        console.log(`Token: ${token}`); // Debugging line
        
        const response = await fetch(`/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`Response status: ${response.status}`); // Debugging line

        if (response.ok) {
            const updatedPost = await response.json();
            updatePostInAllColumns(updatedPost);
            updatePostInSearchMode(updatedPost);
        } else {
            console.error('Failed to like post:', response.status);
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
}
