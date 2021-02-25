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
                const { data } = await axios.post('http://localhost:1323/create-vendor-app', { app: sanitizedVendor });
                const { adminRegistrationUrl } = data;
                await strapi.query('vendor').update(
                    { id: vendor.id },
                    { registration_url: adminRegistrationUrl }
                );
            } catch (error) {
                await strapi.query('vendor').delete({ id: vendor.id });
                throw error;
            }
        },
        async afterDelete(vendor){
            const sanitizedVendor = sanitizeEntity(vendor, { model: strapi.models.vendor });
            await axios.post('http://localhost:1323/destroy-vendor-app', { app: sanitizedVendor });
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