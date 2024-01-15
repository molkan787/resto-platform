module.exports = ({ env }) => ({
  frontendURL: env('FRONTEND_URL', 'http://localhost'),
});
