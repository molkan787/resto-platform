module.exports = {
  apps: [
    {
      name: 'supervisor',
      script: './supervisor/index.js'
    },
    {
      name: 'reverseproxy',
      script: './reverseproxy/index.js'
    },
    {
      name: 'murew-backend',
      script:'./murew-backend/node_modules/strapi/bin/strapi.js',
      args: 'start',
      cwd: './murew-backend'
    }
  ]
}