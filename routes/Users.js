const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const { sql, poolPromise } = require('../db');

router.get('/', async (req, res) => { // Get all users

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
    // Hash the password befrore storing it
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

    try {
        const pool = await poolPromise;
        const user = await pool.request()
            .input('Email', sql.NVarChar, loginEmail)
            .query('SELECT TOP 1 User_ID, UserName, Email, Password FROM BLOG_Users WHERE Email = @Email');

        // Check if the user exists
        if (user.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify the password
        const isPasswordValid = await argon2.verify(user.recordset[0].Password, loginPassword);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Store User_ID, Email, and UserName in the session
        req.session.user = {
            User_ID: user.recordset[0].User_ID,
            UserName: user.recordset[0].UserName,
            Email: user.recordset[0].Email,
        };
        req.session.isLoggedIn = true; // Set the login status
        console.log('User logged in successfully:', req.session.user);


        // Redirect to the home page
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --------------------Logout-------------------------//
router.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        // Redirect to the login page
        res.redirect('/login.html');
        connsole.log('User logged out successfully');
    });
});




module.exports = router; // Export the router
