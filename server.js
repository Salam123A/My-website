require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const expressSanitizer = require('express-sanitizer');
const { body, validationResult } = require('express-validator');
const validator = require('validator');
const http = require('http');
const socketIo = require('socket.io');
const mongoSanitize = require('express-mongo-sanitize');
const { getEdgeConfig } = require('@vercel/edge-config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, process.env.DATA_FILE || 'posts.json');

// Middleware
app.use(mongoSanitize());
app.use(express.json());
app.use(expressSanitizer());
app.use(cors());

// Rate limiting to prevent DDoS attacks
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Ensure posts.json exists
function ensureFileExists() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
}

// Read posts from file
function readPosts() {
  ensureFileExists();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
}

// Write posts to file
function writePosts(posts) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error writing posts:', error);
  }
}

// Serve pepe.html as homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pepe.html'));
});

// Serve pepeexpand.html for expanded posts
app.get('/pepeexpand/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pepeexpand.html'));
});

// 📌 API ROUTES
// Get all posts
app.get('/posts', (req, res) => {
  console.log('GET /posts');
  res.json(readPosts());
});

// Get a single post by ID
app.get('/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id, 10);
  console.log(`GET /posts/${postId}`);

  const posts = readPosts();
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    console.log('Post not found:', postId);
    return res.status(404).json({ error: 'Post not found' });
  }

  res.json(post);
});

// Create a new post
app.post(
  '/posts',
  [
    body('title').trim().escape().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  (req, res) => {
    console.log('POST /posts');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    let { title, content } = req.body;

    // Sanitize input
    title = req.sanitize(title);
    content = req.sanitize(content);

    const posts = readPosts();
    const newPost = { id: Date.now(), title, content, likes: 0, date: new Date().toISOString(), comments: [] };
    posts.push(newPost);
    writePosts(posts);

    res.status(201).json(newPost);

    io.emit('updatePost', newPost); // Broadcast the new post to all clients
  }
);

// Like a post
app.post('/posts/:id/like', (req, res) => {
  const postId = parseInt(req.params.id, 10);
  console.log(`POST /posts/${postId}/like`);

  // Sanitize input
  if (!validator.isInt(postId.toString())) {
    console.log('Invalid post ID:', postId);
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  const posts = readPosts();
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    console.log('Post not found:', postId);
    return res.status(404).json({ error: 'Post not found' });
  }

  post.likes += 1;
  writePosts(posts);

  io.emit('updatePost', post); // Broadcast the updated post to all clients

  res.json(post); // Return the updated post
});

// Add a comment to a post
app.post(
  '/posts/:id/comments',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
  ],
  (req, res) => {
    const postId = parseInt(req.params.id, 10);
    console.log(`POST /posts/${postId}/comments`);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, comment } = req.body;

    // Sanitize input
    if (!validator.isInt(postId.toString())) {
      console.log('Invalid post ID:', postId);
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const posts = readPosts();
    const post = posts.find((p) => p.id === postId);

    if (!post) {
      console.log('Post not found:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = { id: Date.now(), username, comment, date: new Date().toISOString(), likes: 0, postId: postId };
    post.comments.push(newComment);
    writePosts(posts);

    io.emit('updatePost', post); // Broadcast the updated post with new comment to all clients

    res.status(201).json(post); // Return the updated post with new comment
  }
);

// Like a comment
app.post('/posts/:postId/comments/date/:commentDate/like', (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  const commentDate = req.params.commentDate;
  console.log(`POST /posts/${postId}/comments/date/${commentDate}/like`);
  console.log('Post ID:', postId, 'Comment Date:', commentDate); // Debugging line

  // Validate input
  if (!validator.isInt(postId.toString()) || !validator.isISO8601(commentDate)) {
    console.log('Invalid post ID or comment date:', postId, commentDate);
    return res.status(400).json({ error: 'Invalid post ID or comment date' });
  }

  const posts = readPosts();
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    console.log('Post not found:', postId);
    return res.status(404).json({ error: 'Post not found' });
  }

  const comment = post.comments.find((c) => new Date(c.date).toISOString() === new Date(commentDate).toISOString());
  if (!comment) {
    console.log('Comment not found:', commentDate);
    return res.status(404).json({ error: 'Comment not found' });
  }

  comment.likes += 1;
  writePosts(posts);

  io.emit('updatePost', post); // Broadcast the updated post with the liked comment to all clients

  res.json(post); // Return the updated post with the liked comment
});

// Delete a post
app.delete('/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id, 10);
  console.log(`DELETE /posts/${postId}`);

  // Sanitize input
  if (!validator.isInt(postId.toString())) {
    console.log('Invalid post ID:', postId);
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  const posts = readPosts();
  const updatedPosts = posts.filter((post) => post.id !== postId);

  if (posts.length === updatedPosts.length) {
    console.log('Post not found:', postId);
    return res.status(404).json({ error: 'Post not found' });
  }

  writePosts(updatedPosts);
  io.emit('deletePost', postId); // Broadcast the deleted post ID to all clients

  res.json({ message: 'Post deleted' });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Test route to check mongo-sanitize
app.post('/test-sanitize', (req, res) => {
  console.log('Original input:', req.body);
  res.json({ sanitizedInput: req.body });
});

// Use Edge Config to get some configuration
app.get('/config', async (req, res) => {
  try {
    const edgeConfig = await getEdgeConfig();
    res.json(edgeConfig);
  } catch (error) {
    console.error('Error fetching Edge Config:', error);
    res.status(500).json({ error: 'Failed to fetch Edge Config' });
  }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});