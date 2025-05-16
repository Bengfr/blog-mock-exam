const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


const usersRouter = require('./routes/Users');
app.use('/users', usersRouter);

const postsRouter = require('./routes/posts');
app.use('/api/posts', postsRouter); // Register posts router under /api/posts

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});