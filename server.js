const express = require('express');
const path = require('path');
const session = require('express-session'); // Import express-session
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(
    session({
        secret: 'Fagprove', // Replace with a strong secret key
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 60000 }, // 1 minute
    })
);

const usersRouter = require('./routes/Users');
app.use('/users', usersRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});