const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
const usersRouter = require('./routes/users');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const REACT_APP_BACKEND_URL = 'https://pimatribend.onrender.com'; 

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/authenticate', async (req, res, next) => {
  try {
    const authResult = req.body;
    console.log('Authentication Result:', authResult);
    
    const accessToken = jwt.sign({ user: authResult.user }, process.env.JWT_SECRET);
    
    res.json({ accessToken, user: authResult.user });
  } catch (error) {
    console.error('Authentication failed:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
});

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

app.post('/api/handleIncompletePayment', (req, res) => {
  const payment = req.body;
  console.log('Handling incomplete payment:', payment);
  res.sendStatus(200);
});

app.post('/api/approvePayment', (req, res) => {
  const paymentId = req.body.paymentId;
  console.log('Approving payment:', paymentId);
  platformAPIClient.post(`/payments/${paymentId}/approve`)
    .then(() => res.sendStatus(200))
    .catch(error => {
      console.error('Error approving payment:', error.response.data);
      res.status(error.response.status).send(error.response.data);
    });
});

app.post('/api/completePayment', (req, res) => {
  const { paymentId, txid } = req.body;
  console.log('Completing payment:', paymentId, 'with TXID:', txid);
  platformAPIClient.post(`/payments/${paymentId}/complete`, { txid })
    .then(() => res.sendStatus(200))
    .catch(error => {
      console.error('Error completing payment:', error.response.data);
      res.status(error.response.status).send(error.response.data);
    });
});

// Serving Images
app.get('/api/image/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Image not found');
    }
  });
});

app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
