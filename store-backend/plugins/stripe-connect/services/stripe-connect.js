'use strict';

module.exports = {

    async createAccountLink({ refresh_url, return_url }){
        const stripe = await strapi.services.stripe.getInstance();
        const account = await stripe.accounts.create({
            type: 'express',
        });
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: refresh_url,
            return_url: return_url,
            type: 'account_onboarding',
        });
        await strapi.query('vendor-meta').update({}, {
            stripe_connected_account_id: account.id,
            stripe_connected_account_email: '',
            stripe_connected_account_ready: false
        });
        return {
            redirect_url: accountLink.url
        }
    },

    async disconnectAccount(){
        await strapi.query('vendor-meta').update({}, {
            stripe_connected_account_id: '',
            stripe_connected_account_email: '',
            stripe_connected_account_ready: false
        });
    },

    async updateConnectedAccountStatus(){
        const meta = await strapi.query('vendor-meta').findOne();
        const { stripe_connected_account_id } = meta || {};
        if(typeof stripe_connected_account_id !== 'string'){
            throw new Error('No account id found');
        }
        const stripe = await strapi.services.stripe.getInstance();
        const account = await stripe.accounts.retrieve(stripe_connected_account_id);
        const { details_submitted, charges_enabled, email } = account;
        const isReady = !!(details_submitted && charges_enabled);
        if(isReady){
            await strapi.query('vendor-meta').update({}, {
                stripe_connected_account_id: account.id,
                stripe_connected_account_email: email,
                stripe_connected_account_ready: true
            });
        }
        return {
            details_submitted,
            charges_enabled,
            is_ready: isReady
        };
    }

};
