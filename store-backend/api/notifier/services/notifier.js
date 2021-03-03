'use strict';

const { TextUtils } = require('murew-core');
const { send } = require("../../email/services/email");

/**
 * `notifier` service.
 */

module.exports = {

  async sendBookingConfirmation(user, booking){
    const { date, time, store_id, number_of_persons } = booking;
    const store = await strapi.query('store').findOne({ id: store_id });
    const text = [
      `Hello ${user.fullname},`,
      `Your table for ${TextUtils.itemsText(number_of_persons, 'Person', 'Persons')} at ${(store || {}).name} was successfully booked!`,
      `Date: ${new Date(date).toLocaleDateString()}  Time: ${time.split(':').slice(0, 2).join(':')}`,
    ].join('\n');
    await this.send(
      user,
      {
        title: 'Booking Confirmation',
        content: text
      }
    )
  },
  
  async sendOrderStatusUpdate(user, order, readyTime){
    const { no, status } = order;
    let content = '';
    switch (status) {
      case 'placed':
        content = `Your order # ${no} was successfully placed, and it is pending approval by the restaurant.`;
        break;
      case 'accepted':
        content = `Your order # ${no} was accepted, and will be ready in ${TextUtils.minutesToText(readyTime)}.`;
        break;
      case 'declined':
        content = `Your order # ${no} was declined, We are sorry for the inconvenience.`;
        break;
      default:
        return;
    }
    await this.send(
      user,
      {
        title: `Order ${no} was ${status}${status == 'declined' ? '.' : '!'}`,
        content: content
      }
    )
  },


  /**
   * 
   * @param {any} user 
   * @param {{title: string, content: string}} message 
   */
  async send(user, message){
    const { email } = user;
    const { title, content } = message;
    if(typeof email != 'string' || email.length < 5){
      return;
    }
    await strapi.services.email.send(email, title, content);
  }

};
