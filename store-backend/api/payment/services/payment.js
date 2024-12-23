'use strict';

module.exports = {

    async createPaymentIntent(order){
        const { id: orderId, total } = order;
        const intTotal = Math.floor(total * 100);
        if(!(await strapi.services.stripe.isSetupReady())){
            throw new Error('SB-0003: Stripe is not setup');
        }
        const stripe = await strapi.services.stripe.getInstance();
        const paymentIntent = await stripe.paymentIntents.create({
            payment_method_types: ['card'],
            amount: intTotal,
            currency: 'gbp',
            metadata: {
                vendor_id: strapi.config.vendor.VENDOR_ID,
                order_id: orderId,
            },
            // application_fee_amount: Math.floor(intTotal * 0.1),
            // transfer_data: {
            //     destination: connectedAccountId,
            // },
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
     * @param {any} payment Payment object or Payment Id
     * @returns {boolean} returns `true` if the payment succeeded
     */
    async confirmPayment(payment){
        if(typeof payment == 'string'){
            payment = await strapi.query('payment').findOne({ id: payment });
        }
        const stripe = await strapi.services.stripe.getInstance();
        const { payment_intent_id } = payment;
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id, { expand: ['charges.data.balance_transaction'] });
        const succeeded = paymentIntent.status === 'succeeded';
        if(paymentIntent.status !== payment.status){
            await strapi.query('payment').update({
                id: payment.id
            }, {
                status: paymentIntent.status
            })
            if(succeeded && (await strapi.services.stripe.getStripeMode().name === strapi.services.stripe.STRIPE_MODES.PLATFORM_ACCOUNT)){
                try {
                    await this.transformVendorAmount(paymentIntent)
                } catch (error) {
                    console.error(error)
                }
            }
        }
        return succeeded;
    },

    async transformVendorAmount(paymentIntent){
        const stripe = await strapi.services.stripe.getInstance();
        const connectedAccountId = await strapi.services.stripe.getConnectedAccountId()
        if(typeof connectedAccountId !== 'string' || connectedAccountId.length < 10){
            console.error(new Error('Missing stripe connected account id'))
            return
        }
        const { balance_transaction, id: charge_id } = paymentIntent.charges.data[0]
        const { amount, currency, fee: stripe_fee } = balance_transaction
        const net_amount = amount - stripe_fee
        const application_fee = await strapi.services['platform-fees'].getPlatformFeeAmount(net_amount); // 10%
        const vendor_money = net_amount - application_fee;
        const transfer = await stripe.transfers.create({
            amount: vendor_money,
            currency: currency,
            source_transaction: charge_id,
            destination: connectedAccountId,
        });
        if(application_fee > 0){
            await strapi.services['platform-fees'].addThisMonthPaidAmount(application_fee);
        }
        console.log('payment_service.application_fee:', application_fee)
        console.log('payment_service.transfer:', JSON.stringify(transfer));
        return transfer;
    },

};
