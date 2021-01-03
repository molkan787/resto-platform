'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async find(ctx){
        const { store_id } = ctx.params;
        try {
            return await strapi.services['public-menu'].getMenu(store_id);
        } catch (error) {
            if(error.isHttpError){
                ctx.response.status = error.statusCode;
                ctx.response.message= error.message;
            }else{
                throw error;
            }
        }
    }

};
