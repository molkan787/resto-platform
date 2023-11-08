'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async registerClient(context){
        // TODO: Add here some sort of rate limit / spam protection
        const data = await strapi.services['client-registration'].registerClient(context.request.body)
        await new Promise(r => setTimeout(r, 4000)) // tmp
        return data
    }
};
