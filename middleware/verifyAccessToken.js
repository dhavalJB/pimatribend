const platformAPIClient = require('./platformAPIClient');

// Middleware function to verify the access token
const verifyAccessToken = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1];
    const response = await platformAPIClient.post('/v1/auth/access_token/verify', {
      access_token: accessToken
    });
    req.user = response.data.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = verifyAccessToken;
