'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async createOrder(ctx){
        const data = ctx.request.body;
        try {
            const order = await strapi.services.postorder.createOrder(data, ctx.state.user);
            return {
                status: 'ok',
                order
            }
        } catch (error) {
            if(error.isHttpError){
                ctx.response.status = error.statusCode;
                ctx.response.message= error.message;
            }else{
                throw error;
            }
        }
    },
    editOrder(){

    }
};
