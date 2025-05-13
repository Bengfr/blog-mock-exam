const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const port = process.env.PORT || 8080;
const isAuthenticated = require('./middleware/auth').isAuthenticated;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'veldig hemmelig hemmelighet', // Change this to a random string
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

const usersRouter = require('./routes/Users');
app.use('/users', usersRouter);

app.get('/home.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
