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
  cancel: async (ctx) => {
    const { id } = ctx.params;
    await strapi.query('booking', 'booking').update({ id}, { status: 'canceled' });
    return {};
  },
  create: async (ctx) => {
    const { store_id, date, time, number_of_persons, owner } = ctx.request.body;
    const data = { store_id, date, time, number_of_persons, owner };
    await strapi.query('booking', 'booking').create(data);
    return {};
  }
};