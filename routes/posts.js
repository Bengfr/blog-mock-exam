const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

router.get('/', async (req, res) => { // Get all posts
    try {
        const pool = await poolPromise; // Get the connection pool
        const result = await pool.request()
            .query('SELECT * FROM aviw_BLOG_blogPosts'); // Get query
        res.status(200).send({ // Send success response
            message: 'Posts retrieved successfully',
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({ // Send error response
            message: 'Error retrieving posts',
            error: error.message
        });
    }
});


module.exports = router;