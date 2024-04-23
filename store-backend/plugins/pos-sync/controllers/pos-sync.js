'use strict';

/**
 * pos-sync.js controller
 *
 * @description: A set of functions called "actions" of the `pos-sync` plugin.
 */

 const { sanitizeEntity } = require('strapi-utils');

module.exports = {

  // ------------------------- Admin Controllers -------------------------
  // ---------------------------------------------------------------------

  async generateKey(ctx){
    const BACKEND_URL = process.env.BACKEND_URL;
    const { store_id, name } = ctx.request.body;
    const store = await strapi.query('store').findOne({ id: store_id });
    if(!store){
      ctx.badRequest('Store not found');
      return;
    }
    const query = strapi.query('pos-sync-key', 'pos-sync');
    let key = await query.create({
      store: store_id,
      name,
    });
    let key_data = {
      key_id: key.id,
      endpoint: BACKEND_URL,
      store_name: store.name,
    };
    key_data = JSON.stringify(key_data);
    key_data = Buffer.from(key_data).toString('base64');
    key = await query.update({ id: key.id }, { key_data });
    return sanitizeEntity(key, { model: query.model });
  },

  async getAllKeys(){
    const query = strapi.query('pos-sync-key', 'pos-sync');
    const keys = await query.find({ _sort: 'createdAt:DESC' });
    return keys.map(k => sanitizeEntity(k, { model: query.model }));
  },

  async deleteKey(ctx){
    const { id } = ctx.params;
    const query = strapi.query('pos-sync-key', 'pos-sync');
    await query.delete({ id });
    return {};
  },

  // ---------------------------------------------------------------------


  
  // ------------------------- User Controllers --------------------------

  async setOrderStatus(ctx){
    const storeId = await this.validateSyncKey(ctx)
    const { orderNo, statusId } = ctx.request.body
    if(typeof orderNo !== 'string' || typeof statusId !== 'string'){
      throw new Error('Missing parameters.')
    }
    await strapi.query('order').update(
      { no: orderNo, store_id: storeId },
      { status: statusId }
    )
    return {}
  },

  async getOrder(ctx){
    const storeId = await this.validateSyncKey(ctx)
    const { orderNo } = ctx.params;
    if(typeof orderNo !== 'string'){
      throw new Error('Missing parameter.')
    }
    const order = await strapi.query('order').findOne(
      { no: orderNo, store_id: storeId },
    )
    if(order) return order
    else throw new Error('Order not found')
  },

  async validateSyncKey(ctx){
    const key = ctx.headers['sync-key']
    if(typeof key !== 'string') throw new Error('Missing Sync Key (sync-key header)')
    const keyData = JSON.parse(Buffer.from(key, 'base64').toString())
    const storeId = strapi.services.posSyncService.server.getStoreId(keyData.key_id)
    if(!storeId) throw new Error('Invalid Sync Key (sync-key header)')
    return storeId
  }
  
  // ---------------------------------------------------------------------


};
