const StripeModule = require('stripe')

async function test() {
    const stripe = StripeModule('sk_test_4LCSqX9JvZ6nHYNB0yVlnUYi');
    const customer = await stripe.customers.create({
        email: 'test@gmail.com',
        name: 'Test Person',
    })
    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
            {
                price: 'price_1Opu9CKXZ8t5Xqf0auzeOrGe',
            }
        ],
        add_invoice_items: [
            {
                price: 'price_1OpuB9KXZ8t5Xqf0ZKGqued5',
            }
        ],
        metadata: {
            applicationId: '65e3531c26789216a0257f27'
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        payment_settings: {
            payment_method_types: ['card']
        }
    });
    await stripe.paymentIntents.update(
        subscription.latest_invoice.payment_intent.id,
        {
          metadata: {
            applicationId: '65e3531c26789216a0257f27'
          },
        }
    )
    const data = {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    }
    console.log(data)
}

// test()