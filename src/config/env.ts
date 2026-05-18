export const ENV = {
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.example.com/v1',
  APP_ENV: process.env.APP_ENV || 'development',
  isDev: __DEV__,
  isProd: !__DEV__,
};
