require('dotenv').config();

const config = require('./app.json');

module.exports = {
  ...config.expo,
  updates: {
    url: "https://u.expo.dev/1d12a307-8863-46fb-934a-70b1c20f0d49"
  },
  runtimeVersion: {
    policy: "appVersion"
  },
  extra: {
    ...(config.expo.extra || {}),
    openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '',
  },
};
