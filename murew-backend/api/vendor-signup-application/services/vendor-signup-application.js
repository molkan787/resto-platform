'use strict';

const { validStringOrNone } = require('../../../utils/js-utils');
const { validateApplicationData } = require('./application-data-schema')

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {

    async createApplication(data){
        // Data Validation
        const { value: vData, error } = validateApplicationData(data)
        if(error){
            return { error }
        }
        const paymentModelDoc = await this._validatePaymentModelId(vData)
        const isCommissionBased = paymentModelDoc.model_type === 'percentage'

        // Storing application data in database
        vData.domain_name = vData.domain_name.toLowerCase()
        const { domain_name } = vData
        if(await this.isDomainAlreadyRegistered(domain_name)){
            return { error: `Domain name "${domain_name}" is already registered in our system, Please use another.` }
        }
        const picked_cluster = await strapi.services['clusters-manager'].pickCluster()
        const { id: applicationId } = await strapi.query('vendor-signup-application').create({
            status: isCommissionBased ? 'awaiting_dns' : 'payment_info',
            data: vData,
            cluster: picked_cluster,
        })

        // Creating stripe subscription
        if(!isCommissionBased){
            const { stripe_recurring_price_id, stripe_oneoff_price_id } = paymentModelDoc
            const sub = await strapi.services['stripe-pilot'].createSubscription(
                applicationId,
                {
                    email: vData.account_email,
                    fullname: `${vData.account_first_name} ${vData.account_last_name}`,
                },
                {
                    recurring: stripe_recurring_price_id,
                    oneoff: validStringOrNone(stripe_oneoff_price_id),
                }
            )

            await strapi.query('vendor-signup-application').update(
                { id: applicationId },
                {
                    internal_data: {
                        stripe_subscription_id: sub.subscriptionId,
                        stripe_pi_client_secret: sub.clientSecret,
                    }
                }
            )
        }
        
        // Notifying the customer
        this.sendWelcomeEmail(applicationId, data)

        return await this.getPublicApplicationData(applicationId)
    },

    /**
     * Validates the existence of the payment model and checks if the selected features matches it's features,
     * throws Error to indicate something is not valid
     * @param {Record<string, any>} data 
     * @returns {Promise<Record<string, any>>} Returns the PaymentModel Document (data object)
     */
    async _validatePaymentModelId(data){
        const { payment_model, feature_desktop_pos, feature_website, feature_mobileapp } = data
        const pm = await strapi.query('payment-model').findOne({ id: payment_model })
        if(!pm) throw new Error('Payment model does not exist')
        const { desktop_pos, website, mobile_app } = pm.features
        const featuresMatches = (
            !!desktop_pos === !!feature_desktop_pos &&
            !!website === !!feature_website &&
            !!mobile_app === !!feature_mobileapp
        )
        if(!featuresMatches) throw new Error('Features does not match')
        return pm
    },

    async isDomainAlreadyRegistered(domainName){
        const vendor = await strapi.query('vendor').findOne({ domain: domainName })
        return !!vendor
    },

    async getPublicApplicationData(applicationId){
        if(!applicationId) throw new Error('applicationId is required')
        const doc = await strapi.query('vendor-signup-application').findOne({ id: applicationId })
        if(doc){
            const { id, status, data, internal_data, cluster } = doc
            const { domain_name } = data
            
            const _extra_data = {}
            if(status === 'payment_info'){
                // providing `stripe_pi_client_secret` only if the status is `payment_info`, no other properties of `internal_data` should be provided at any status
                _extra_data.stripe_pi_client_secret = internal_data.stripe_pi_client_secret
                
                const pm = await strapi.query('payment-model').findOne({ id: doc.data.payment_model })
                const { name, model_type, amount, maintenance } = pm
                const pm_pd = { name, model_type, amount, maintenance }
                _extra_data.payment_model = pm_pd
                _extra_data.stripe_publishable_key = strapi.services['stripe-pilot'].getPublishableKey()
            }
            
            return {
                id,
                status,
                data: { domain_name },
                cluster: {
                    public_ip: cluster.public_ip
                },
                ..._extra_data
            }
        }else{
            return null
        }
    },

    async confirmPayment(applicationId, payload){
        if(!applicationId) throw new Error('applicationId is required')
        if(!payload.payment_intent) throw new Error('payment_intent id is required')
        const isPaymentCompleted = await strapi.services['stripe-pilot'].validatePaymentIntent(applicationId, payload.payment_intent)
        if(isPaymentCompleted){
            const doc = await strapi.query('vendor-signup-application').findOne({ id: applicationId })
            const { status } = await strapi.query('vendor-signup-application').update(
                { id: applicationId },
                {
                    status: 'awaiting_dns',
                    internal_data: {
                        ...doc.internal_data,
                        stripe_payment_intent_id: payload.payment_intent
                    }
                }
            )
            return { status }
        }else{
            return { error: 'Could not confirm payment' }
        }
    },

    async verifyDNS(applicationId){
        // TODO: confirm if the application is at the right step
        if(!applicationId) throw new Error('applicationId is required')
        const doc = await strapi.query('vendor-signup-application').findOne({ id: applicationId })
        if(doc && doc.status === 'awaiting_dns'){
            const { id, data, cluster } = doc
            const { domain_name } = data
            const backend_domain_name = 'backend.' + domain_name
            const { public_ip } = cluster
            const check1 = await strapi.services.helpers.isDomainPointingToIp(domain_name, public_ip)
            const check2 = await strapi.services.helpers.isDomainPointingToIp(backend_domain_name, public_ip)

            if(check1 && check2){ // DNS Config is valid (domains points to server's ip)
                const aid = applicationId
                strapi.services['client-registration'].registerClient(data, { platform_cluster: cluster })
                .then(() => {
                    return strapi.query('vendor-signup-application').update(
                        { id: aid },
                        { status: 'completed' }
                    )
                }).catch(err => {
                    console.error(`Vendor registration failed { applicationId = ${id}, domain = ${domain_name} }`)
                    console.error(err)
                    strapi.query('vendor-signup-application').update(
                        { id: aid },
                        { status: 'create_failed' }
                    )
                })
                const { status } = await strapi.query('vendor-signup-application').update(
                    { id: applicationId },
                    { status: 'creating_vendor' }
                )
                return { status }
            }else{
                return { status: 'awaiting_dns' }
            }
    
        }
        return null
    },


    async sendWelcomeEmail(applicationId, formData){
        const appLink = `https://ujusteat.com/registration/?aid=${applicationId}`
        const { account_first_name, account_last_name, account_email } = formData
        const emailText = `
        Welcome Mr(s) ${account_first_name} ${account_last_name},
        This email confirms that you have started setting-up your restauration platform, you can continue the process anytime by accessing the following link:
        ${appLink}

        Best regards,
        uJustEat
        `
        const payload = {
            to: account_email,
            subject: 'Welcome to uJustEat',
            text: emailText,
            html: '',
            senderName: 'uJustEat',
        }
        return await axios.post(`http://emailagent:3033/sendMail`, payload)
    },

};