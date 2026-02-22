require('dotenv').config();

const config = require('./app.json');

module.exports = {
  ...config.expo,
  extra: {
    ...(config.expo.extra || {}),
    openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '',
  },
};
