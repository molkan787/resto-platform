const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:1337'

export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'murew-frontend',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'author', content: 'Seghier Dahmane' },
      { name: 'creator', content: 'Seghier Dahmane' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ]
  },
  // <meta name="author" content="Seghier Dahmane" />
  // <meta name="creator" content="Seghier Dahmane" />

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    { src: 'vuesax/dist/vuesax.css' },
    { src: 'boxicons/css/boxicons.min.css' },
    { src: '@/assets/styles/index.scss'},
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    { src: '@/plugins/vuesax' },
    { src: '@/plugins/rellax', mode: 'client' },
    { src: '@/plugins/vue-gallery', mode: 'client' },
    { src: '@/plugins/vuejs-datepicker', mode: 'client' },
    { src: '@/plugins/is-mobile' },
    { src: '@/plugins/global-filters' },
    { src: '@/plugins/services' },
    { src: '@/plugins/cookie-expire-time' },
    // { src: '@/plugins/persisted-state.client', mode: 'client' }
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxtjs/device'
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    '@nuxtjs/strapi',
    'vuejs-google-maps/nuxt',
    'nuxt-lazy-load'
  ],

  strapi: {
    url: process.env.BACKEND_URL || 'http://localhost:1337',
    entities: ['categories', 'products', 'orders', 'stores']
  },

  googleMaps: {
    apiKey: 'AIzaSyA_NUNyAIGRql39ijC3rDqt0D8PAf00GKs',
    libraries: []
  },

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {
    baseURL: process.env.BACKEND_URL || 'http://localhost:1337'
  },

  lazyLoad: {
    directiveOnly: true,
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
  },

  server: {
    host: "0.0.0.0"
  }
}
