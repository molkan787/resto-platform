const DATABASE_URI = 'mongodb://root:murew_is_magic@localhost:27018'

module.exports = {
  apps: [
    {
      name: 'supervisor',
      cwd: './supervisor',
      script: './index.js',
      env: {
        'PUBLIC_IP': '127.0.0.1',
        'DATABASE_URI': DATABASE_URI
      }
    },
    {
      name: 'murew-backend',
      cwd: './murew-backend',
      script:'./node_modules/strapi/bin/strapi.js',
      args: 'start',
      env: {
        'DATABASE_URI': `${DATABASE_URI}/admin`
      }
    },
    {
      name: 'apps-builder-agent',
      cwd: './apps-builder-agent',
      script: 'index.js',
      interpreter: '/root/.nvm/versions/node/v20.10.0/bin/node',
      env: {
        'DATABASE_URI': DATABASE_URI
      }
    },
    {
      name: 'nginx-reverseproxy-client',
      cwd: './nginx-reverseproxy-client',
      script: './index.js'
    },
  ]
}