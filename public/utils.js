function sanitizeInput(input) {
    const element = document.createElement('div');
    element.innerText = input;
    return element.innerHTML;
}

function sanitizeHTML(html) {
    const element = document.createElement('div');
    element.innerHTML = html;

    // Allow iframes specifically for YouTube, TikTok, Twitter, and Twitch
    const iframes = element.getElementsByTagName('iframe');
    for (let i = 0; i < iframes.length; i++) {
        const iframe = iframes[i];
        if (iframe.src && 
            (iframe.src.startsWith('https://www.youtube.com/') || 
             iframe.src.startsWith('https://www.tiktok.com/') || 
             iframe.src.startsWith('https://www.x.com/') || 
             iframe.src.startsWith('https://platform.twitter.com/') ||
             iframe.src.startsWith('https://player.twitch.tv/') ||
             iframe.src.startsWith('https://www.twitch.tv/') ||
             iframe.src.startsWith('https://twitch.tv/')))
             {
            continue;
        }
        iframe.parentNode.removeChild(iframe);
    }

    return element.innerHTML;
}

function isValidURL(url) {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,})|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-zA-Z0-9@:%_\\+.~#?&//=]*)?' + // port and path
        '(\\?[;&a-zA-Z0-9%_\\+.~#?&//=]*)?' + // query string
        '(\\#[-a-zA-Z0-9_]*)?$','i'); // fragment locator
    return !!pattern.test(url);
}

function convertLinksToEmbeds(content) {
    const lines = content.split('\n');
    let result = '';

    lines.forEach(line => {
        // Check if the line contains a YouTube link
        const youtubeMatch = line.match(/https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
        if (youtubeMatch && isValidURL(youtubeMatch[0])) {
            const videoId = youtubeMatch[1];
            result += `<div class="text-above-embed"><p>${sanitizeInput(line.replace(youtubeMatch[0], '').trim())}</p></div>`;
            result += `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
            return;
        }

        // Check if the line contains a TikTok link
        const tiktokMatch = line.match(/https:\/\/www\.tiktok\.com\/@([a-zA-Z0-9_.]+)\/video\/([0-9]+).*/);
        if (tiktokMatch && isValidURL(tiktokMatch[0])) {
            const videoId = tiktokMatch[2];
            result += `<div class="text-above-embed"><p>${sanitizeInput(line.replace(tiktokMatch[0], '').trim())}</p></div>`;
            result += `<iframe width="60" height="760" src="https://www.tiktok.com/embed/${videoId}" frameborder="1" allowfullscreen></iframe>`;
            return;
        }

        // Check if the line contains a Twitter link
        const twitterMatch = line.match(/https:\/\/twitter\.com\/([a-zA-Z0-9_]+)\/status\/([0-9]+)/);
        if (twitterMatch && isValidURL(twitterMatch[0])) {
            const username = twitterMatch[1];
            const tweetId = twitterMatch[2];
            // Only embed the tweet, do not display the link
            result += `<blockquote class="twitter-tweet" data-theme="dark"><a href="https://twitter.com/${username}/status/${tweetId}?ref_src=twsrc%5Etfw"></a></blockquote>`;
            return;
        }

        // Check if the line contains a Twitch link to a channel
        const twitchMatch = line.match(/https:\/\/(www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/);
        if (twitchMatch && isValidURL(twitchMatch[0])) {
            const channelName = twitchMatch[2];
            result += `<div class="text-above-embed"><p>${sanitizeInput(line.replace(twitchMatch[0], '').trim())}</p></div>`;
            result += `<iframe src="https://player.twitch.tv/?channel=${channelName}&parent=${window.location.hostname}" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="620"></iframe>`;
            return;
        }

        // Check if the line contains an image link
        const imageMatch = line.match(/(https:\/\/.*\.(?:png|jpg|jpeg|gif))/i);
        if (imageMatch && isValidURL(imageMatch[0])) {
            result += `<div class="text-above-embed"><p>${sanitizeInput(line.replace(imageMatch[0], '').trim())}</p></div>`;
            result += `<img src="${imageMatch[0]}" alt="Embedded Image" style="max-width: 100%; height: auto;">`;
            return;
        }

        // If no match, add the line as plain text
        result += `<p>${sanitizeInput(line)}</p>`;
    });

    return result;
}
function toggleComments(postId, containerId) {
    const commentsContainer = document.getElementById(`comments-${postId}-${containerId}`);
    if (commentsContainer) {
        commentsContainer.style.display = commentsContainer.style.display === 'none' ? 'block' : 'none';
        render(); // Call render function after toggling comments
    }
}

function sharePost(postId) {
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
        const postTitle = sanitizeInput(postElement.querySelector('h3').textContent);
        const postContent = sanitizeInput(postElement.querySelector('.post-content').textContent);
        const containerId = sanitizeInput(postElement.querySelector('.sort-buttons .share-btn').dataset.containerId);
        const containerElement = document.getElementById(containerId);
        const containerStyle = window.getComputedStyle(containerElement);
        const formattedContent = `Title: ${postTitle}\nContent: ${postContent}\nContainer Style: ${containerStyle.cssText}`;
        const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(formattedContent)}`;

        if (isValidURL(shareUrl)) {
            window.open(shareUrl, '_blank');
        } else {
            alert("Invalid URL for sharing.");
        }
        render(); // Call render function after sharing the post
    }
}

function deletePost(postId) {
    const password = prompt("Please enter the password to delete this post:");
    if (password === "CacatPisat") {
        fetch(`/posts/${postId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    document.getElementById(`post-${postId}`).remove();
                    removePostFromAllColumns(postId);
                } else {
                    alert("Failed to delete post.");
                }
            })
            .catch(error => {
                console.error("Error deleting post:", error);
                alert("Error deleting post.");
            });
    } else {
        alert("Incorrect password.");
    }
}

function expandPost(postId) {
    const sanitizedPostId = sanitizeInput(postId.toString());
    const url = `pepeexpand.html?postId=${sanitizedPostId}`;
    if (isValidURL(url)) {
        window.open(url, '_blank');
    } else {
        alert("Invalid URL.");
    }
}

// Assume render function is defined elsewhere
function render() {
    // Implementation of render function
}

function validateTitle(title) {
    return title.length <= 16;
}

function validateUsername(username) {
    return username.length <= 16;
}
	function validateContent(content) {
		return content.length <= 50;
	}
