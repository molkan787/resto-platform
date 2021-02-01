'use strict';

/**
 * A set of functions called "actions" for `geo`
 */

module.exports = {
  getDistanceBetweenPostcodes: async (ctx, next) => {
    const { postcode1, postcode2 } = ctx.params;
    const response = await strapi.services.geo.getDistanceBetweenPostcodes(postcode1, postcode2);
    ctx.send(response);
    // console.log(response);
  }
};
