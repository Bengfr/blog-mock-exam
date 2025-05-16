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
    const userId = req.user.userId; // From decoded JWT
    console.log('userId:', userId, 'title:', title, 'description:', description);
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
    const { post_ID } = req.body;
    const userId = req.user.userId; // From decoded JWT

    try {
        const pool = await poolPromise;
        await pool.request()
        
            .input('Post_ID', sql.Int, post)
            .input('User_ID', sql.Int, userId)
            .query('EXEC astp_BLOG_RemoveBlogPost (@Post_ID, @User_ID)');
        res.status(201).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
});

module.exports = router;