const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Import JWT library
const axios = require('axios'); // Import Axios
const usersRouter = require('./routes/users'); // Assuming you have a users router defined

// Load environment variables from .env file
dotenv.config();

// Create an Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to authenticate user by checking the access token
app.use('/api/authenticate', async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw new Error('Authorization header is missing');

    // Extract the token from the authorization header
    const token = authorization.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Authentication failed:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
});

// Middleware to interact with Pi blockchain
app.use('/api/pi', async (req, res, next) => {
  try {
    const response = await axios.post('https://api.minepi.com/verifyAccessToken', { token: req.headers.authorization }, {
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`
      }
    });
    req.user = response.data.user;
    next();
  } catch (error) {
    console.error('Error interacting with Pi blockchain:', error);
    res.status(500).json({ message: 'Error interacting with Pi blockchain' });
  }
});

// Routes
app.use('/api/users', usersRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
