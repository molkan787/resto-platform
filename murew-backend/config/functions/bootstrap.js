'use strict';

module.exports = async () => {
    await strapi.services['stripe-pilot'].init()
};
