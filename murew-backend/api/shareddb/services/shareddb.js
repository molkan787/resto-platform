'use strict';

const { MongoClient } = require('mongodb');

/**
 * `shareddb` service.
 */

module.exports = {
  async init(){
    const sharedDbUri = process.env.DATABASE_URI || 'mongodb://localhost:27017/admin';
    this.mongoClient = await MongoClient.connect(sharedDbUri);
    this.sharedDb = this.mongoClient.db('murew-shared');
  },

  async getDb(){
    if(!this.mongoClient || !this.sharedDb){
      await this.init();
    }
    return this.sharedDb;
  },

  async getMongoClient(){
    if(!this.mongoClient){
      await this.init();
    }
    return this.mongoClient;
  }

};
