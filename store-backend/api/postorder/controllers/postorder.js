'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async createOrder(ctx){
        const data = ctx.request.body;
        try {
            const response = await strapi.services.postorder.createOrder(data, ctx.state.user);
            return response;
        } catch (error) {
            console.error(error)
            if(error.isHttpError){
                ctx.response.status = error.statusCode;
                ctx.response.message = error.message;
            }else{
                throw error;
            }
        }
    },

    async confirmOrderPayment(ctx){
        const { order_id } = ctx.params;
        try {
            const response = await strapi.services.postorder.confirmOrderPayment(order_id);
            return response;
        } catch (error) {
            console.error(error)
            if(error.isHttpError){
                ctx.response.status = error.statusCode;
                ctx.response.message = error.message;
            }else{
                throw error;
            }
        }
    }
};
