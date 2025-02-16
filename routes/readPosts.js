const express = require('express');
const { get } = require('@vercel/blob');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const response = await get('posts.json');
    const posts = JSON.parse(await response.text());
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error reading posts:', error);
    res.status(500).json({ error: 'Failed to read posts' });
  }
});

module.exports = router;
