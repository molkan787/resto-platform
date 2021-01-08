module.exports = {
  load: {
    order: ['ipr'],
    after: ['httperrors']
  },
  settings: {
    httperrors: {
      enabled: true,
    },
    ipr: {
      enabled: true,
    }
  },
}