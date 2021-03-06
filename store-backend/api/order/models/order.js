'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {

    lifecycles: {
        async beforeUpdate(params, data){
            const order = await strapi.query('order').findOne(params);
            const status = order && order.status;
            const newStatus = data.status;
            if(status && status != newStatus && newStatus == 'completed'){
                strapi.services.notifier.sendOrderCompletedConfirmation(order.owner, order);
            }
        }
    }

};
