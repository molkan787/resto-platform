'use strict';

/**
 * A set of functions called "actions" for `vendor-backend`
 */

module.exports = {
  async index(ctx){
    const { vendor_id } = ctx.params;
    const isDevVendor = vendor_id === 'murew-store';
    const dbName = isDevVendor ? 'murew-store' : `vendor_db_${vendor_id}`;
    const client = await strapi.services.shareddb.getMongoClient();
    const db = client.db(dbName);
    const token = randomString(30);
    await db.collection('direct_auth_tokens').insert({
      token: token,
      user_email: 'platform@muerw.xyz',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const vendor = await strapi.query('vendor').findOne({ id: vendor_id });
    const url = isDevVendor ? `http://localhost:1337/direct-auth/${token}` : `http://backend.${vendor.domain}/direct-auth/${token}`;
    ctx.send({
      url
    })
  }
};

function randomString(length) {
  var result           = '';
  var characters       = 'abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXYZz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}