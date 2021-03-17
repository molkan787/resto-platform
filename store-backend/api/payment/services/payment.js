'use strict';

const stripe = require('stripe')('sk_test_4LCSqX9JvZ6nHYNB0yVlnUYi');

module.exports = {

    async createPaymentIntent(order){
        const { id: orderId, total } = order;
        const intTotal = Math.floor(total * 100);
        const paymentIntent = await stripe.paymentIntents.create({
            payment_method_types: ['card'],
            amount: intTotal,
            currency: 'gbp',
            metadata: {
                vendor_id: this.getCurrentVendorId(),
                order_id: orderId,
            }
        });
        const { id: payment_intent_id, client_secret, amount, currency, status } = paymentIntent;
        const payment = {
            type: 'stripe',
            order_id: orderId,
            payment_intent_id: payment_intent_id,
            client_secret: client_secret,
            status: status,
            amount: amount,
            currency: currency
        };
        await strapi.query('payment').create(payment);
        return paymentIntent;
    },

    /**
     * 
     * @param {any} payment Payment object or Payment Id
     * @returns {boolean} returns `true` if the payment succeeded
     */
    async confirmPayment(payment){
        if(typeof payment == 'string'){
            payment = await strapi.query('payment').findOne({ id: payment });
        }
        const { payment_intent_id } = payment;
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
        
        if(paymentIntent.status !== payment.status){
            await strapi.query('payment').update({
                id: payment.id
            }, {
                status: paymentIntent.status
            });
        }
        return paymentIntent.status === 'succeeded';
    },

    getCurrentVendorId(){
        return process.env.VENDOR_ID || 'dev_vendor';
    }

};
