module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      // connector: 'bookshelf',
      // settings: {
      //   client: 'sqlite',
      //   filename: env('DATABASE_FILENAME', '.tmp/data.db'),
      // },
      // options: {
      //   useNullAsDefault: true,
      // },
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
