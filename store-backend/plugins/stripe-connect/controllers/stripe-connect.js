'use strict';

/**
 * stripe-connect.js controller
 *
 * @description: A set of functions called "actions" of the `stripe-connect` plugin.
 */

module.exports = {

  getStripeState: async (ctx) => {
    const vendor_meta = await strapi.query('vendor-meta').findOne();
    const { stripe_connected_account_id, stripe_connected_account_email, stripe_connected_account_ready } = vendor_meta || {};
    ctx.send({
      connected_account_id: stripe_connected_account_id || null,
      connected_account_email: stripe_connected_account_email || null,
      connected_account_ready: stripe_connected_account_ready || false
    });
  },

  async createAccountLink(ctx){
    const data = await strapi.plugins['stripe-connect'].services['stripe-connect'].createAccountLink(ctx.request.body);
    ctx.send(data);
  },

  async updateConnectedAccountStatus(ctx){
    const response = await strapi.plugins['stripe-connect'].services['stripe-connect'].updateConnectedAccountStatus();
    ctx.send(response);
  },

  async disconnectAccount(ctx){
    await strapi.plugins['stripe-connect'].services['stripe-connect'].disconnectAccount();
    ctx.send({});
  }

};
