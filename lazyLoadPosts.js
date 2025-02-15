function lazyLoadPosts(posts, container) {
    let loadedPosts = 0;
    const postsPerLoad = 5;

    function loadMorePosts() {
        const end = loadedPosts + postsPerLoad;
        const postsToLoad = posts.slice(loadedPosts, end);
        renderPostColumn(postsToLoad, container);
        loadedPosts += postsPerLoad;

        if (loadedPosts >= posts.length) {
            container.removeEventListener('scroll', onScroll);
        }
    }

    function onScroll() {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
            loadMorePosts();
        }
    }

    container.addEventListener('scroll', onScroll);
    loadMorePosts();
}