'use strict';

/**
 * platform-features.js controller
 *
 * @description: A set of functions called "actions" of the `platform-features` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  getFeatures: async (ctx) => {
    const features = await strapi.plugins['platform-features'].services['platform-features'].getDetailedFeatures()
    ctx.send({
      features
    })
  }
};
