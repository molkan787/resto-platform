'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    async getCustomCSSContent(){
        const docs = await strapi.query('theme-settings').find()
        return (docs[0] || {}).custom_css || ''
    }
};
