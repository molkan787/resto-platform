'use strict';

const stripe = require('stripe');

/**
 * `stripe` service.
 */
module.exports = {
  _check_timer: null,

  async isSetupReady(){
    return await this.getStripeMode().name !== this.STRIPE_MODES.NONE
  },

  async getInstance(){
    if(!this.instance){
      const secretKey = await this.getStripeSecretKey();
      if(!isValidString(secretKey)){
        throw new Error(`SB-0002: Stripe secret key not found.`)
      }
      this.createStripeInstance(secretKey);

      // periodically check if the stripe secret key changed and if so re-create the stripe instance using that new secret key
      if(this._check_timer) clearInterval(this._check_timer)
      this._check_timer = setInterval(() => this.checkForSecretKeyChange(), 5 * 60 * 1000);
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
    const stripeMode = await this.getStripeMode()
    if(stripeMode.name === this.STRIPE_MODES.STORE_ACCOUNT){
      return stripeMode.config.stripe_SECRET_KEY
    }else if(stripeMode.name === this.STRIPE_MODES.PLATFORM_ACCOUNT){
      const { stripe_sk } = await strapi.services.shared.getSettings();
      return stripe_sk;
    }else if(stripeMode.name === this.STRIPE_MODES.NONE){
      return null
    }else{
      throw new Error(`SB-0001: Unknow stripe mode.`)
    }
  },

  async getStripePublicKey(){
    const stripeMode = await this.getStripeMode()
    if(stripeMode.name === this.STRIPE_MODES.STORE_ACCOUNT){
      return stripeMode.config.stripe_PUBLIC_KEY
    }else if(stripeMode.name === this.STRIPE_MODES.PLATFORM_ACCOUNT){
      const { stripe_pk } = await strapi.services.shared.getSettings()
      return stripe_pk
    }else if(stripeMode.name === this.STRIPE_MODES.NONE){
      return null
    }else{
      throw new Error(`SB-0001: Unknow stripe mode.`)
    }
  },

  /**
   * Returns stripe setup mode
   * @returns {string} StripeMode Name
   * @satisfies ***it must be guaranteed to return a valid string***
   */
  async getStripeMode(){
    const doc = await strapi.query('vendor-meta').findOne()
    if(doc && doc.store_stripe_account && doc.store_stripe_account.enabled){
      return {
        name: this.STRIPE_MODES.STORE_ACCOUNT,
        config: doc.store_stripe_account,
      }
    }else if(isValidString(this.getConnectedAccountId())){
      return {
        name: this.STRIPE_MODES.PLATFORM_ACCOUNT
      }
    }else{
      return {
        name: this.STRIPE_MODES.NONE
      }
    }
  },

  async getConnectedAccountId(){
    const vendor_meta = await strapi.query('vendor-meta').findOne();
    const { stripe_connected_account_id, stripe_connected_account_ready } = vendor_meta || {};
    if(stripe_connected_account_ready && typeof stripe_connected_account_id == 'string'){
        return stripe_connected_account_id;
    }else{
        return null;
    }
  },


  // DEFINE
  STRIPE_MODES: Object.freeze({
    PLATFORM_ACCOUNT: 'platform-stripe-account',
    STORE_ACCOUNT: 'store-account',
    NONE: 'none',
  }),

};

function isValidString(val){
  return typeof val === 'string' && val.length > 0
}
