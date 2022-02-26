const path = require('path');

const port = process.env.port && !isNaN(parseInt(process.env.port)) ? parseInt(process.env.port) : 8080;

const downloadPath = path.join(__dirname, '..', 'downloads');

const config = {
  port,
  downloadPath,
  api_key: process.env.api_key || '',
  api_secret: process.env.api_secret || '',
  token: process.env.token || '',
  token_secret: process.env.token_secret || '',
};

export default config;
