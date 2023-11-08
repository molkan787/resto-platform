'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async resolveHostIps(context){
        const host = context.request.query.host
        try {
            const result = await strapi.services.helpers.resolveHostIps(host)
            return {
                result
            }
        } catch (error) {
            return {
                result: []
            }
        }
    }
};
