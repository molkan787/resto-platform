'use strict';

/**
 * reports.js controller
 *
 * @description: A set of functions called "actions" of the `reports` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  generate: async (ctx) => {
    const { dateFrom, dateTo } = ctx.query;
    const buffer = await strapi.plugins.reports.services.reports.generateReports(dateFrom, dateTo);
    // xl.write('Reports.xlsl', ctx.res);
    ctx.response.attachment('Reports.xlsl');
    ctx.response.send(buffer);
    // await new Promise(r => setTimeout(r, 100));
  }
};
