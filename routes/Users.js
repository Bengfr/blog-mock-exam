const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const { sql, poolPromise } = require('../db');
const { authenticateToken } = require('../middleware/auth'); // Import the middleware
const jwt = require('jsonwebtoken');

router.get('/', authenticateToken, async (req, res) => { // Get all users

    try {
        const pool = await poolPromise; // Get the connection pool
        const result = await pool.request()
            .query('SELECT * FROM BLOG_Users'); // Get query
        res.status(200).send({ // Send success response
            message: 'Users retrieved successfully',
            data: result.recordset
        });
    } catch (error) {
        res.status(500).send({ // Send error response
            message: 'Error retrieving users',
            error: error.message
        });
    }
});


// --------------------Signup-------------------------//
router.post('/signup', async (req, res) => { // Sign up a new user
    const { signupUsername, signupEmail, signupPassword } = req.body;

    // Validate the input, check if all fields are provided
    if (!signupUsername || !signupEmail || !signupPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    // Hash the password before storing it
    const hashedPassword = await argon2.hash(signupPassword);
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('UserName', sql.NVarChar, signupUsername)
            .input('Email', sql.NVarChar, signupEmail)
            .input('Password', sql.NVarChar, hashedPassword)
            .query('EXEC astp_BLOG_CreateUser @UserName, @Email, @Password');
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});
// --------------------Login-------------------------//
router.post('/login', async (req, res) => {
    const { loginEmail, loginPassword } = req.body;
    if (!loginEmail || !loginPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.NVarChar, loginEmail)
            .query('SELECT TOP 1 User_ID, UserName, Email, Password FROM BLOG_Users WHERE Email = @Email');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordValid = await argon2.verify(result.recordset[0].Password, loginPassword);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create JWT token
        const user = {
            userId: result.recordset[0].User_ID,
            userName: result.recordset[0].UserName,
            email: result.recordset[0].Email
        };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET); // Token expires in 30minutes

        // Send token to client
        return res.json({ accessToken });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router; // Export the router
