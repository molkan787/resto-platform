export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'murew-frontend',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    { src: 'vuesax/dist/vuesax.css' },
    { src: 'boxicons/css/boxicons.min.css' },
    { src: '@/assets/styles/index.scss'},
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    { src: '@/plugins/vuesax' },
    { src: '@/plugins/global-filters' },
    { src: '@/plugins/services' },
    { src: '@/plugins/cookie-expire-time' },
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // '@nuxtjs/axios',
    '@nuxtjs/strapi'
  ],

  strapi: {
    url: 'http://localhost:1337',
    entities: ['categories', 'products', 'orders']
  },

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {
    baseURL: 'http://localhost:1337'
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
  }
}
