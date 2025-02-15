const socket = io();

document.addEventListener("DOMContentLoaded", function () {
    renderPosts();
});

document.getElementById("postForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = sanitizeInput(document.getElementById("title").value.trim());
    const content = document.getElementById("content").value.trim();

    if (!title || !content) {
        alert('Please enter both title and content.');
        return;
    }

    // Fetch user IP address
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const userIp = ipData.ip;

    console.log(`New post added by user IP: ${userIp}`); // Debugging line

    const response = await fetch('/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
    });

    if (response.ok) {
        const newPost = await response.json();
        renderNewPost(newPost); // Automatically render the new post in the "newest posts" column
        document.getElementById("title").value = ''; // Clear the title input field
        document.getElementById("content").value = ''; // Clear the content input field
    } else {
        alert("Error adding post");
    }
});

document.addEventListener('click', async function (e) {
    if (e.target.classList.contains('like-btn') || e.target.parentElement.classList.contains('like-btn')) {
        e.preventDefault();
        const postId = e.target.dataset.id || e.target.parentElement.dataset.id;

        // Fetch user IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const userIp = ipData.ip;

        console.log(`Post liked by user IP: ${userIp}, postId: ${postId}`); // Debugging line

        likePost(postId); // Call likePost function when a post is liked
    } else if (e.target.classList.contains('reply-btn') || e.target.parentElement.classList.contains('reply-btn')) {
        e.preventDefault();
        const postId = e.target.dataset.id || e.target.parentElement.dataset.id;
        const columnId = e.target.closest('.column').id;

        showCommentForm(postId, columnId); // Pass columnId to showCommentForm
    } else if (e.target.classList.contains('comment-like-btn')) {
        e.preventDefault();
        const commentDate = e.target.dataset.date;
        const postId = e.target.dataset.postId;

        // Fetch user IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const userIp = ipData.ip;

        console.log(`Comment liked by user IP: ${userIp}, postId: ${postId}, commentDate: ${commentDate}`); // Debugging line

        likeComment(postId, commentDate);
    } else if (e.target.classList.contains('sort-comments')) {
        e.preventDefault();
        const postId = e.target.dataset.id;
        const sortBy = e.target.dataset.sortBy;
        sortComments(postId, sortBy);
    } else if (e.target.classList.contains('toggle-comments-btn')) {
        e.preventDefault();
        const postId = e.target.dataset.id;
        const containerId = e.target.dataset.containerId;
        toggleComments(postId, containerId);
    } else if (e.target.classList.contains('share-btn')) {
        e.preventDefault();
        const postId = e.target.dataset.id;
        sharePost(postId);
    }
});

// Listen for updates from the server
socket.on('updatePost', function (updatedPost) {
    const existingPostElement = document.getElementById(`post-${updatedPost.id}`);
    if (existingPostElement) {
        updatePostInAllColumns(updatedPost);
    } else {
        renderNewPost(updatedPost);
    }
});

// Initialize the page
renderPosts();