async function renderPosts() {
    console.log('Starting renderPosts');
    const posts = await fetchPosts();
    console.log('Posts fetched:', posts);
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