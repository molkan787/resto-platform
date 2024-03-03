const stripe = require('stripe')

module.exports = {
    stripeInstance: null,
    publishable_key: '',
    async init(){
        try {
            const { secret_key, publishable_key } = await strapi.query('stripe-settings').findOne()
            this.publishable_key = publishable_key
            this.stripeInstance = stripe(secret_key);
            console.log('Successfully initlized stripe instance')
        } catch (error) {
            console.error('An error occured while initlizing stripe instance')
            console.error(error)
        }
    },

    getPublishableKey(){
        return this.publishable_key
    },

    async validatePaymentIntent(applicationId, paymentIntentId){
        const paymentIntent = await this.stripeInstance.paymentIntents.retrieve(paymentIntentId)
        if(paymentIntent && paymentIntent.status === 'succeeded'){
            return paymentIntent.metadata.applicationId === applicationId
        }
        return false
    },

    async createSubscription(applicationId, customerData, pricesIds){
        const customer = await this.stripeInstance.customers.create({
            email: customerData.email,
            name: customerData.fullname,
        })
        const subscription = await this.stripeInstance.subscriptions.create({
            customer: customer.id,
            items: [
                {
                    price: pricesIds.recurring,
                }
            ],
            add_invoice_items: (
                pricesIds.oneoff ?
                [
                    {
                        price: pricesIds.oneoff,
                    }
                ] :
                undefined
            ),
            metadata: {
                applicationId: applicationId
            },
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            payment_settings: {
                payment_method_types: ['card']
            }
        });
        await this.stripeInstance.paymentIntents.update(
            subscription.latest_invoice.payment_intent.id,
            {
              metadata: {
                applicationId: applicationId
              },
            }
        )
        const data = {
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        }
        return data
    }
}