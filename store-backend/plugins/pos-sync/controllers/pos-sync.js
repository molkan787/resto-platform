'use strict';

/**
 * pos-sync.js controller
 *
 * @description: A set of functions called "actions" of the `pos-sync` plugin.
 */

 const { sanitizeEntity } = require('strapi-utils');

module.exports = {

  async generateKey(ctx){
    const BACKEND_URL = process.env.BACKEND_URL;
    const { store_id, name } = ctx.request.body;
    const query = strapi.query('pos-sync-key', 'pos-sync');
    let key = await query.create({
      store: store_id,
      name,
    });
    let key_data = {
      key_id: key.id,
      endpoint: BACKEND_URL
    }
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
  }
};
