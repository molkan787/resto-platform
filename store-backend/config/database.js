module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'mongoose',
      settings: {
        uri: env('DATABASE_URI', 'mongodb://localhost:27017/murew-store'),
      },
      options: {
        ssl: false,
      },
    },
  },
});
