'use strict';

/**
 * `public` service.
 */

module.exports = {
  getFrontendSettings: async () => {
    const data = await Promise.all([
      strapi.query('layout-settings').findOne(),
      strapi.query('store-settings').findOne()
    ])
    const [ layout, store ] = data;
    const { order_page_layout } = layout;
    const { delivery_cost, free_delivery_maximum_distance, enable_delivery_orders, enable_pickup_orders, enable_preorders, minimum_order_value } = store;
    return {
      layout: { order_page_layout },
      store: { delivery_cost, free_delivery_maximum_distance, enable_delivery_orders, enable_pickup_orders, enable_preorders, minimum_order_value }
    }
  }
};
