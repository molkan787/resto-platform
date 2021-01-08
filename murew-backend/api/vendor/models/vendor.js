'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */
const axios = require('axios');
const { sanitizeEntity } = require('strapi-utils');

module.exports = {
    lifecycles: {
        async beforeCreate(data){
            data.domain = data.domain.toLowerCase();
            data.port_pointer = await generatePortPointer();
        },
        async afterCreate(vendor){
            try {
                const sanitizedVendor = sanitizeEntity(vendor, { model: strapi.models.vendor });
                await axios.post('http://localhost:8023/create-vendor-app', { app: sanitizedVendor });
            } catch (error) {
                await strapi.query('vendor').delete({ id: vendor.id });
                throw error;
            }
        }
    }
};

async function generatePortPointer(){
    const doc = await strapi.query('metadata').model.findOneAndUpdate({}, {
        $inc: {
            port_pointer: 1
        }
    });
    const { port_pointer } = doc;
    return port_pointer;
}