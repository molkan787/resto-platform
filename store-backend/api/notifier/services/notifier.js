'use strict';

const { send } = require("../../email/services/email");

/**
 * `notifier` service.
 */

module.exports = {
  
  async sendOrderStatusUpdate(user, order, readyTime){
    const { no, status } = order;
    let content = '';
    switch (status) {
      case 'placed':
        content = `Your order # ${no} was successfully placed, and it is pending approval by the restaurant.`;
        break;
      case 'accepted':
        content = `Your order # ${no} was accepted, and will be ready in ${readyTime}.`;
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
