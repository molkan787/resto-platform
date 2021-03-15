'use strict';

const { generateReferenceNumber } = require("murew-core");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {

    async incPointer(name){
        const prop = `${name}_pointer`;
        const doc = await strapi.query('metadata').model.findOneAndUpdate({}, {
            $inc: {
                [prop]: 1
            }
        });
        return doc[prop];
    },

    async generateReferenceNumber(metaname, prefix){
        const pointer = await strapi.services.metadata.incPointer(metaname + '_no');
        return generateReferenceNumber(pointer, prefix);
    }

};
