const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM aviw_BLOG_blogPosts');
        res.status(200).send({
            message: 'Posts retrieved successfully',
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error retrieving posts',
            error: error.message
        });
    }
});

// Create new post (protected)
router.post('/newpost', authenticateToken, async (req, res) => {
    const { title, description } = req.body; // <-- Match frontend keys!
    const userId = req.user.userId; // From JWT
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('User_ID', sql.Int, userId)
            .input('Title', sql.NVarChar, title)
            .input('Description', sql.NVarChar, description)
            .query('EXEC astp_BLOG_CreateNewPosts  @User_ID, @Title, @Description');
        res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
});

// Delete post (protected)
router.post('/deletepost', authenticateToken, async (req, res) => {
    const { post } = req.body; // <-- Match frontend key!
    const userId = req.user.userId;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('User_ID', sql.Int, userId)
            .input('Post_ID', sql.Int, post)
            .query('EXEC astp_BLOG_RemoveBlogPost @User_ID, @Post_ID');
        res.status(201).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
});
// like post (protected)
router.post('/likepost', authenticateToken, async (req, res) => {
    const { post } = req.body;
    const userId = req.user.userId;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('User_ID', sql.Int, userId)
            .input('Post_ID', sql.Int, post)
            .query('EXEC astp_BLOG_NewPostLikes @User_ID, @Post_ID');
        const newLikeCount = result.recordset[0]?.LikeCount;
        res.status(201).json({ message: 'Post liked successfully', newLikeCount });
    } catch (error) {
        res.status(500).json({ message: 'Error liking post', error: error.message });
    }
});

// edit post (protected)
router.post('/editpost', authenticateToken, async (req, res) => {
    const {post, title, description } = req.body; // <-- Match frontend keys!
    const userId = req.user.userId; // From JWT
    console.log('User ID:', userId);
    console.log('Post ID:', post);
    console.log('Title:', title);
    console.log('Description:', description);
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('User_ID', sql.Int, userId)
            .input('Post_ID', sql.Int, post)
            .input('Title', sql.NVarChar, title)
            .input('Description', sql.NVarChar, description)
            .query('EXEC astp_BLOG_UpdateBlogPost  @User_ID, @post_ID, @Title, @Description');
        res.status(201).json({ message: 'Post edited successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
});


module.exports = router;