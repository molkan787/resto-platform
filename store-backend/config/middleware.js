module.exports = {
    load: {
        after: ['httperrors']
    },
    settings: {
      httperrors: {
        enabled: true,
      },
    },
  }