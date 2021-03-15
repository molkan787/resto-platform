'use strict';

/**
 * booking.js controller
 *
 * @description: A set of functions called "actions" of the `booking` plugin.
 */

module.exports = {
  find: async (ctx) => {
    const { query } = ctx;
    const bookings = await strapi.query('booking', 'booking').find(query);
    return bookings;
  },
  findMy: async (ctx) => {
    const { query } = ctx;
    const bookings = await strapi.query('booking', 'booking').find(query);
    return bookings;
  },
  cancelMy: async (ctx) => {
    const { id } = ctx.params;
    const query = strapi.query('booking', 'booking');
    const { owner } = await query.findOne({ id });
    const userId = ctx.state.user.id;
    if(typeof owner === 'undefined' || owner === null || typeof owner.id !== 'string' || owner.id !== userId){
      return ctx.unauthorized(`You are not allowed to perform this action. [3]`);
    }
    await strapi.query('booking', 'booking').update({ id }, { status: 'canceled' });
    strapi.services.posSyncService.requestBookingsSyncing();
    return {};
  },
  cancel: async (ctx) => {
    const { id } = ctx.params;
    await strapi.query('booking', 'booking').update({ id }, { status: 'canceled' });
    strapi.services.posSyncService.requestBookingsSyncing();
    return {};
  },
  create: async (ctx) => {
    const { store_id, date, time, number_of_persons, owner, category } = ctx.request.body;
    const data = { store_id, date, time, number_of_persons, owner, category };
    await strapi.query('booking', 'booking').create(data);
    strapi.services.posSyncService.requestBookingsSyncing();
    return {};
  }
};
