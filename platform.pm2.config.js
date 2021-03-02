module.exports = {
  apps: [
    {
      name: 'supervisor',
      cwd: './supervisor',
      script: './index.js',
    },
    {
      name: 'reverseproxy',
      cwd: './reverseproxy',
      script: './index.js'
    },
    {
      name: 'murew-backend',
      cwd: './murew-backend',
      script:'./node_modules/strapi/bin/strapi.js',
      args: 'start',
      env: {
        'DATABASE_URI': 'mongodb://root:murew_is_magic@localhost:27018/admin'
      }
    }
  ]
}