'use strict';

const { sanitizeEntity } = require('strapi-utils');

/**
 * `public` service.
 */

module.exports = {
  getFrontendSettings: async () => {
    const pageQuery = strapi.query('pages');
    const data = await Promise.all([
      strapi.query('layout-settings').findOne(),
      strapi.query('store-settings').findOne(),
      pageQuery.find({
        published_at_null: false
      })
    ])
    const [ layout, store, pages ] = data;
    const { order_page_layout, primary_color, website_logo } = layout;
    const { delivery_cost, free_delivery_maximum_distance, enable_delivery_orders, enable_pickup_orders, enable_preorders, minimum_order_value } = store;
    return {
      layout: {
        order_page_layout,
        primary_color: JSON.parse(primary_color).rgb,
        website_logo: website_logo.formats.thumbnail.url
      },
      store: { delivery_cost,
        free_delivery_maximum_distance,
        enable_delivery_orders,
        enable_pickup_orders,
        enable_preorders,
        minimum_order_value
      },
      pages: pages.map(({ show_in_navigation_menu, name, slug }) => ({ show_in_navigation_menu, name, slug })),
    }
  }
};
