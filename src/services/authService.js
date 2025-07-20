const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  verifyToken: (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decoded JWT:', decoded);
      return decoded; 
    } catch (error) {
      throw new Error('Invalid token');
    }
  },
};
