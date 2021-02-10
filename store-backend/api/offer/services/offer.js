'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {

    validateOfferData(data){
        const { activated_by_promo_code, promo_code } = data;
        if(activated_by_promo_code && (typeof promo_code != 'string' || promo_code.length < 2 )){
            throw new Error('When option "Activated by promo code" is enabled a promo code must be specified');
        }
        return true;
    }

};
