async function addComment(postId, username, comment) {
    const response = await fetch(`/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, comment })
    });
    if (response.ok) {
        const updatedPost = await response.json();
        console.log('Updated Post