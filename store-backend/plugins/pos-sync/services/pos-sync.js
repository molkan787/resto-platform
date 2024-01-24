'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * pos-sync.js service
 */

const RESEND_INTERVAL = 1000 * 60 * 1

const posSync = module.exports = {
    async doWork(){
        await new Promise(r => setTimeout(r, 10000)) // wait for strapi initialization
        while(true){
            try {
                await this.resendUnhandledOrders()
            } catch (error) {
                console.error('posSync: An error occured while resending unhandled orders')
                console.error(error)
            }
            await new Promise(r => setTimeout(r, RESEND_INTERVAL))
        }
    },
    async resendUnhandledOrders(){
        const orders = await strapi.query('order').find({
            status: 'placed',
        })
        for(let order of orders){
            const diff = new Date().getTime() - order.updatedAt.getTime()
            if(diff >= RESEND_INTERVAL){
                this.sendOrder(order)
            }
        }
    },
    sendOrder(order){
        const sanitizedOrderData = sanitizeEntity(order, { model: strapi.models.order });
        strapi.services.posSyncService.sendOrder(sanitizedOrderData);
    }
};

posSync.doWork()