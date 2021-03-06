'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async postReview(ctx){
        const { user } = ctx.state;
        const { order_no, rating, comment } = ctx.request.body;
        const order = await strapi.query('order').findOne({ no: order_no });
        const orderOwnerId = order && order.owner && order.owner.id;
        const userId = ctx.state.user.id;
        if(orderOwnerId && userId && orderOwnerId === userId){
            const reviewQuery = strapi.query('review');
            const existingReview = await reviewQuery.findOne({ order_no: order_no });
            if(existingReview){
                return ctx.badRequest(`Order ${order_no} has been already reviewed.`);
            }else{
                await reviewQuery.create({
                    order_no: order_no,
                    owner: userId,
                    rating: rating,
                    comment: comment,
                    customer_name: user.fullname,
                    published_at: null
                })
            }
        }else{
            return ctx.unauthorized(`You are not authorized to review order ${order_no}`);
        }
        return {};
    }

};
