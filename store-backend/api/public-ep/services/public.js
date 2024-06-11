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
      pageQuery.find({ published_at_null: false }),
      strapi.services.shared.getVendorPlan(),
    ])
    const [ layout, store, pages, vendorPlan ] = data;
    const { order_page_layout, primary_color, website_logo } = layout;
    const { delivery_cost, free_delivery_maximum_distance, maximum_delivery_distance, enable_delivery_orders, enable_pickup_orders, enable_preorders, minimum_order_value } = store;
    const { mobile_app } = vendorPlan.features || {}
    const logoUrl = ((website_logo.formats || {}).thumbnail || website_logo).url
    const stripe_publicKey = await strapi.services.stripe.getStripePublicKey()
    return {
      features: {
        mobile_app: !!mobile_app
      },
      layout: {
        order_page_layout,
        primary_color: JSON.parse(primary_color).rgb,
        website_logo: logoUrl
      },
      store: {
        delivery_cost,
        free_delivery_maximum_distance,
        maximum_delivery_distance,
        enable_delivery_orders,
        enable_pickup_orders,
        enable_preorders,
        minimum_order_value
      },
      payment_settings: {
        stripePk: stripe_publicKey,
        stripe_enabled: !!stripe_publicKey,
      },
      pages: pages.map(({ show_in_navigation_menu, name, slug }) => ({ show_in_navigation_menu, name, slug })),
    }
  }
};
