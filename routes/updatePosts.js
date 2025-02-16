const express = require('express');
const { put, get } = require('@vercel/blob');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const newPosts = req.body;
    await put('posts.json', JSON.stringify(newPosts, null, 2), { access: 'public' });
    res.status(200).json(newPosts);
  } catch (error) {
    console.error('Error updating posts:', error);
    res.status(500).json({ error: 'Failed to update posts' });
  }
});

module.exports = router;
