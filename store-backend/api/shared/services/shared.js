'use strict';

const { MongoClient } = require('mongodb');

function getSharedDbUriFromVendorDbUri(uri){
  const sharedDbName = 'murew-shared';
  const [url] = uri.split('?');
  const paths = url.split('/');
  paths[paths.length - 1] = sharedDbName;
  return [paths.join('/'), `authSource=${sharedDbName}`].join('?');
}

/**
 * `shared` service.
 */
const dbUri = strapi.config.database.connections.default.settings.uri;
const sharedDbUri = getSharedDbUriFromVendorDbUri(dbUri);

const SharedService = {
  
  async init(){
    this.mongoClient = await MongoClient.connect(sharedDbUri);
    this.sharedDb = this.mongoClient.db('murew-shared');
  },

  async getReady(){
    if(!this.mongoClient){
      await this.init();
    }
  },

  async getSettings(){
    await this.getReady();
    const { _id, ...settings } = await this.sharedDb.collection('settings').findOne({});
    return settings;
  },

  async getVendorPlan(){
    await this.getReady();
    const VendorId = process.env.VENDOR_ID || 'dev_vendor';
    const plan = await this.sharedDb.collection('vendor_plans').findOne({ _id: VendorId });
    return plan || {
      plan: 'none',
      amount: 0
    };
    // return {
    //   plan: 'monthly_fee',
    //   amount: 10
    // }
    // return {
    //   plan: 'percentage',
    //   amount: 8
    // }
  }

};

module.exports = SharedService;