document.getElementById("postForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = sanitizeInput(document.getElementById("title").value.trim());
    const content = document.getElementById("content").value.trim();

    if (!title || !content) {
        alert('Please enter both title and content.');
        return;
    }

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