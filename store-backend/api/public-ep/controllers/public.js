'use strict';

/**
 * A set of functions called "actions" for `public`
 */

module.exports = {
  frontendSettings: async (ctx, next) => {
    const settings = await strapi.services.public.getFrontendSettings();
    ctx.send(settings)
  }
};
