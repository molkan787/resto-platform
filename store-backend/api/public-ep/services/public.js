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
      strapi.query('vendor-meta').findOne(),
      strapi.services.shared.getSettings(),
      pageQuery.find({
        published_at_null: false
      })
    ])
    const [ layout, store, vendor_meta, shared_settings, pages ] = data;
    const { order_page_layout, primary_color, website_logo } = layout;
    const { delivery_cost, free_delivery_maximum_distance, enable_delivery_orders, enable_pickup_orders, enable_preorders, minimum_order_value } = store;
    const { stripe_connected_account_ready: stripe_ready, stripe_connected_account_id } = vendor_meta;
    return {
      layout: {
        order_page_layout,
        primary_color: JSON.parse(primary_color).rgb,
        website_logo: website_logo.formats.thumbnail.url
      },
      store: {
        delivery_cost,
        free_delivery_maximum_distance,
        enable_delivery_orders,
        enable_pickup_orders,
        enable_preorders,
        minimum_order_value
      },
      payment_settings: {
        stripePk: stripe_ready ? shared_settings.stripe_pk : '',
        stripe_enabled: stripe_ready,
        // stripe_account_id: stripe_ready ? stripe_connected_account_id : '',
      },
      pages: pages.map(({ show_in_navigation_menu, name, slug }) => ({ show_in_navigation_menu, name, slug })),
    }
  }
};
