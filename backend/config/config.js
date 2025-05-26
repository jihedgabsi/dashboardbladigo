require('dotenv').config();

module.exports = {
  PORT: process.env.PORT ,
  MONGO_URI: process.env.MONGO_URI ,
  IMAGE_SERVER_URL: process.env.IMAGE_SERVER_URL || 'http://localhost:3000/upload'
};