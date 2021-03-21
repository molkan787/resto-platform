'use strict';

const stripe = require('stripe');

/**
 * `stripe` service.
 */

module.exports = {
  async getInstance(){
    if(!this.instance){
      const secretKey = await this.getStripeSecretKey();
      this.createStripeInstance(secretKey);

      // periodically check if the stripe secret key changed and if so re-create the stripe instance using that new secret key
      setInterval(() => this.checkForSecretKeyChange(), 5 * 60 * 1000);
    }
    return this.instance;
  },

  createStripeInstance(secretKey){
    this.instanceSecretKey = secretKey;
    this.instance = stripe(secretKey);
    console.log('[Stripe] instance created');
  },

  async checkForSecretKeyChange(){
    const sk = await this.getStripeSecretKey();
    if(sk !== this.instanceSecretKey){
      this.createStripeInstance(sk);
    }
  },

  async getStripeSecretKey(){
    const { stripe_sk } = await strapi.services.shared.getSettings();
    return stripe_sk;
  }
};
