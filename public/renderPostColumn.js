function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function renderPosts() {
    fetch('/posts')
        .then(response => response.json())
        .then(posts => {
            const newestPostsContainer = document.getElementById('newestPosts');
            const mostLikedPostsContainer = document.getElementById('mostLikedPosts');
            const randomPostsContainer = document.getElementById('randomPosts');
            newestPostsContainer.innerHTML = '';
            mostLikedPostsContainer.innerHTML = '';
            randomPostsContainer.innerHTML = '';

            const sortedByDate = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
            const sortedByLikes = [...posts].sort((a, b) => b.likes - a.likes);
            const sortedByComments = [...posts].sort((a, b) => b.comments.length - a.comments.length);

            lazyLoadPosts(sortedByDate, newestPostsContainer);
            lazyLoadPosts(sortedByLikes, mostLikedPostsContainer);
            lazyLoadPosts(sortedByComments, randomPostsContainer);
        })
        .catch(error => console.error('Error fetching posts:', error));
}

function lazyLoadPosts(posts, container) {
    let loadedPosts = 0;
    const postsPerLoad = 4;

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
    const isSplitMode = document.getElementById('splitContainer').classList.contains('split');

    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post';
        div.id = `post-${post.id}`;

        let content = `
            <button class="fullscreen-btn" data-id="${sanitizeInput(post.id.toString())}" style="background-color: lightblue; padding: 5px; border: none; border-radius: 5px; cursor: pointer; top: 5px; right: 5px;">Fullscreen</button>
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
                <button class="reply-btn" data-id="${sanitizeInput(post.id.toString())}" data-column-id="${sanitizeInput(container.id)}"><i class="fas fa-reply"></i> Reply</button><br>
                <button class="share-btn" data-id="${sanitizeInput(post.id.toString())}" data-column-id="${sanitizeInput(container.id)}"><i class="fas fa-share"></i> Share on X</button>
                
        `;

        if (!isSplitMode) {
            content += `
                <button class="toggle-comments-btn" data-id="${sanitizeInput(post.id.toString())}" data-container-id="${sanitizeInput(container.id)}"><i class="fas fa-comments"></i> Hide/Show Comments</button>
                <button class="delete-btn" data-id="${sanitizeInput(post.id.toString())}" style="background: none; border: none; color: red; font-size: 10px; cursor: pointer;">x</button>
            `;
        }

        content += `
            </div>
            <hr class="comment-separator">
            <div class="comments" id="comments-${sanitizeInput(post.id.toString())}-${sanitizeInput(container.id)}" style="max-height: 300px; overflow-y: auto;">
                ${renderCommentsHTML(post.comments)}
            </div>
            <hr class="comment-end-separator">
        `;
        if (isSplitMode) {
            content += `
                <center>
                    <button class="toggle-comments-btn" data-id="${sanitizeInput(post.id.toString())}" data-container-id="${sanitizeInput(container.id)}"><i class="fas fa-comments"></i> Hide/Show Comments</button>
                </center>
            `;
        }
        div.innerHTML = content;
        container.appendChild(div);

        // Remove existing event listeners and add new ones
        const oldLikeBtn = div.querySelector('.like-btn');
        const newLikeBtn = oldLikeBtn.cloneNode(true);
        oldLikeBtn.parentNode.replaceChild(newLikeBtn, oldLikeBtn);
        newLikeBtn.addEventListener('click', () => handleLike(post.id, container.id));

        const oldReplyBtn = div.querySelector('.reply-btn');
        const newReplyBtn = oldReplyBtn.cloneNode(true);
        oldReplyBtn.parentNode.replaceChild(newReplyBtn, oldReplyBtn);
        newReplyBtn.addEventListener('click', () => handleReply(post.id, container.id));

        const oldToggleCommentsBtn = div.querySelector('.toggle-comments-btn');
        const newToggleCommentsBtn = oldToggleCommentsBtn.cloneNode(true);
        oldToggleCommentsBtn.parentNode.replaceChild(newToggleCommentsBtn, oldToggleCommentsBtn);
        newToggleCommentsBtn.addEventListener('click', () => handleToggleComments(post.id, container.id));

        const oldDeleteBtn = div.querySelector('.delete-btn');
        if (oldDeleteBtn) {
            const newDeleteBtn = oldDeleteBtn.cloneNode(true);
            oldDeleteBtn.parentNode.replaceChild(newDeleteBtn, oldDeleteBtn);
            newDeleteBtn.addEventListener('click', () => deletePost(post.id));
        }

        const fullscreenBtn = div.querySelector('.fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => showPostInFullscreen(post.id));
        }

        // Apply the shake and glow effect
        div.classList.add('shake-glow');
        setTimeout(() => {
            div.style.transition = 'opacity 0.5s';
            div.style.opacity = '1';
        }, 10);

        // Remove the effect after 1 second
        setTimeout(() => {
            div.classList.remove('shake-glow');
        }, 1470);
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

function updatePostInAllColumns(updatedPost) {
    ['newestPosts', 'mostLikedPosts', 'randomPosts'].forEach(containerId => {
        const postElement = document.getElementById(containerId)?.querySelector(`#post-${sanitizeInput(updatedPost.id.toString())}`);
        if (postElement) {
            const postLikesFooter = postElement.querySelector('.post-likes-footer span');
            postLikesFooter.textContent = sanitizeInput(updatedPost.likes.toString());

            const commentsContainer = postElement.querySelector('.comments');
            if (commentsContainer) {
                commentsContainer.innerHTML = renderCommentsHTML(updatedPost.comments);
            }

            // Apply the shake and glow effect for updates
            postElement.classList.add('shake-glow');
            setTimeout(() => {
                postElement.style.transition = 'opacity 0.5s';
                postElement.style.opacity = '1';
            }, 10);

            // Remove the effect after 1 second
            setTimeout(() => {
                postElement.classList.remove('shake-glow');
            }, 1470);
        }
    });
}

function updatePostInSearchMode(updatedPost) {
    const postElement = document.querySelector(`#searchResults #post-${sanitizeInput(updatedPost.id.toString())}-search`);
    if (postElement) {
        const postLikesFooter = postElement.querySelector('.post-likes-footer span');
        postLikesFooter.textContent = sanitizeInput(updatedPost.likes.toString());

        const commentsContainer = postElement.querySelector('.comments');
        if (commentsContainer) {
            commentsContainer.innerHTML = renderCommentsHTML(updatedPost.comments);
        }

        // Apply the shake and glow effect for updates
        postElement.classList.add('shake-glow');
        setTimeout(() => {
            postElement.style.transition = 'opacity 0.5s';
            postElement.style.opacity = '1';
        }, 10);

        // Remove the effect after 1 second
        setTimeout(() => {
            postElement.classList.remove('shake-glow');
            }, 1470);
    }
}

function updatePostInFullscreen(updatedPost) {
    const postElement = document.querySelector(`#fullscreenPostContent #post-${sanitizeInput(updatedPost.id.toString())}`);
    if (postElement) {
        const postLikesFooter = postElement.querySelector('.post-likes-footer span');
        postLikesFooter.textContent = sanitizeInput(updatedPost.likes.toString());

        const commentsContainer = postElement.querySelector('.comments');
        if (commentsContainer) {
            commentsContainer.innerHTML = renderCommentsHTML(updatedPost.comments);
        }

        // Apply the shake and glow effect for updates
        postElement.classList.add('shake-glow');
        setTimeout(() => {
            postElement.style.transition = 'opacity 0.5s';
            postElement.style.opacity = '1';
        }, 10);

        // Remove the effect after 1 second
        setTimeout(() => {
            postElement.classList.remove('shake-glow');
        }, 1470);
    }
}
async function searchPosts(query) {
    try {
        const response = await fetch(`/posts`);
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        const posts = await response.json();
        const results = posts.filter(post => post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query));
        renderSearchResults(results);
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function renderSearchResults(posts) {
    const postsContainer = document.getElementById('postsContainer');
    const searchResults = document.getElementById('searchResults');
    const searchResultsContainer = document.getElementById('searchResultsContainer');

    // Remove all other containers and posts
    postsContainer.remove();
    const otherContainers = document.querySelectorAll('#newestPosts, #mostLikedPosts, #randomPosts');
    otherContainers.forEach(container => container.remove());

    searchResults.style.display = 'block';
    searchResultsContainer.innerHTML = '';

    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post fullscreen-post';
        div.id = `post-${post.id}-search`;

        div.innerHTML = `
            <h3 class="post-title">${sanitizeHTML(post.title)}</h3>
            <div class="post-content">
                ${convertLinksToEmbeds(sanitizeHTML(post.content))}
            </div>
            <hr class="post-separator">
            <div class="post-footer">
                <p class="post-date">${new Date(post.date).toLocaleString()}</p>
				    <button class="fullscreen-btn" data-id="${sanitizeInput(post.id.toString())}" style="background-color: lightblue; padding: 5px; border: none; border-radius: 5px; cursor: pointer; top: 5px; right: 5px;">⛶</button>
                <p class="post-likes-footer">Likes: <span class="likes-count">${sanitizeInput(post.likes.toString())}</span></p>
            </div>
            <div class="post-actions">
                <button class="like-btn" data-id="${sanitizeInput(post.id.toString())}"><i class="fas fa-thumbs-up"></i> Like</button>
                <button class="reply-btn" data-id="${sanitizeInput(post.id.toString())}" data-column-id="searchResults"><i class="fas fa-reply"></i> Reply</button>
            </div>
            <hr class="comment-separator">
            <div class="comments" id="comments-${sanitizeInput(post.id.toString())}-search" style="max-height: 300px; overflow-y: auto;">
                ${renderCommentsHTML(post.comments)}
            </div>
        `;

        searchResultsContainer.appendChild(div);
    });

    attachEventListeners(); // Ensure event listeners are attached to the new elements
}
function showPostInFullscreen(postId) {
    const splitContainer = document.getElementById('splitContainer');
    const fullscreenPostContainer = document.getElementById('fullscreenPostContainer');
    const fullscreenPostContent = document.getElementById('fullscreenPostContent');

    // Hide split container
    splitContainer.style.display = 'none';

    // Show fullscreen post container
    fullscreenPostContainer.style.display = 'block';

    // Clear previous content
    fullscreenPostContent.innerHTML = '';

    // Fetch the post data
    fetch(`/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            const div = document.createElement('div');
            div.className = 'post fullscreen-post';
            div.id = `post-${post.id}`;

            let content = `
            <button class="fullscreen-btn" data-id="${sanitizeInput(post.id.toString())}" style="background-color: lightblue; padding: 1px; border: none; border-radius: 1px; cursor: pointer; top: 1px; right: 1px;"> ⛶ </button>
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
                    <button class="reply-btn" data-id="${sanitizeInput(post.id.toString())}" data-column-id="fullscreenPostContent"><i class="fas fa-reply"></i> Reply</button><br>
                    <button class="share-btn" data-id="${sanitizeInput(post.id.toString())}" data-column-id="fullscreenPostContent"><i class="fas fa-share"></i> Share on X</button>
                    <button class="toggle-comments-btn" data-id="${sanitizeInput(post.id.toString())}" data-container-id="fullscreenPostContent"><i class="fas fa-comments"></i> Hide/Show Comments</button>
                    <button class="delete-btn" data-id="${sanitizeInput(post.id.toString())}" style="background: none; border: none; color: red; font-size: 10px; cursor: pointer;">x</button>
                </div>
                <hr class="comment-separator">
                <div class="comments" id="comments-${sanitizeInput(post.id.toString())}-fullscreenPostContent" style="max-height: 300px; overflow-y: auto;">
                    ${renderCommentsHTML(post.comments)}
                </div>
                <hr class="comment-end-separator">
            `;

            div.innerHTML = content;
            fullscreenPostContent.appendChild(div);

    
            // Apply the shake and glow effect
            div.classList.add('shake-glow');
            setTimeout(() => {
                div.style.transition = 'opacity 0.5s';
                div.style.opacity = '1';
            }, 10);

            // Remove the effect after 1 second
            setTimeout(() => {
                div.classList.remove('shake-glow');
            }, 1470);
        })
        .catch(error => console.error('Error fetching post:', error));
}

document.getElementById('exitFullscreenButton').addEventListener('click', () => {
    document.getElementById('fullscreenPostContainer').style.display = 'none';
    document.getElementById('splitContainer').style.display = 'flex';
});

async function handleLike(postId, columnId) {
    try {
        const token = localStorage.getItem('token'); // Get the stored JWT token
        const response = await fetch(`/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const updatedPost = await response.json();
            if (columnId === 'fullscreenPostContent') {
                updatePostInFullscreen(updatedPost);
            } else {
                updatePostInAllColumns(updatedPost);
                updatePostInSearchMode(updatedPost);
            }
        } else {
            console.error('Failed to like post:', response.status);
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
}


function handleReply(postId, columnId) {
    // Toggle comment form
      
	    const container = document.querySelector(`#${sanitizeInput(containerId)} #comments-${sanitizeInput(postId.toString())}-${sanitizeInput(containerId)}`);
    if (!container) return;

    let form = container.querySelector('.comment-form');
    if (form) {
        form.remove();
    } else {
        form = document.createElement('div');
        form.className = 'comment-form';
        form.style = `
            display: flex;
            flex-direction: column;
            background: #1e1e1e;
            padding: 10px;
            border: 1px solid #333;
            border-radius: 5px;
            margin-bottom: 10px;
        `;
        form.innerHTML = `
            <input type="text" class="comment-username" placeholder="Your Name" style="margin-bottom: 5px; padding: 5px; border: 1px solid #555; border-radius: 3px; background-color: #333; color: #fff;">
            <textarea class="comment-input" placeholder="Write a comment..." rows="2" style="margin-bottom: 5px; padding: 5px; border: 1px solid #555; border-radius: 3px; background-color: #333; color: #fff;"></textarea>
            <button class="comment-submit" data-id="${sanitizeInput(postId.toString())}" data-column-id="${sanitizeInput(containerId)}" style="padding: 5px; background-color: #444; color: #fff; border: none; border-radius: 3px;">Submit</button>
        `;
        container.insertBefore(form, container.firstChild);
    }
}
}

function handleToggleComments(postId) {
    const commentsContainer = document.getElementById(`comments-${sanitizeInput(postId.toString())}`);
    if (commentsContainer) {
        commentsContainer.style.display = commentsContainer.style.display === 'none' ? 'block' : 'none';
    }
}

function sanitizeInput(input) {
    const temp = document.createElement('div');
    return temp.inner ▋
    temp.textContent = input;
}