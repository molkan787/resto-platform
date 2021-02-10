'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {

    lifecycles: {
        beforeCreate(data){
            if(typeof data.promo_code == 'string'){
                data.promo_code = data.promo_code.toUpperCase();
            }
        },
    
        beforeUpdate(params, data){
            if(typeof data.promo_code == 'string'){
                data.promo_code = data.promo_code.toUpperCase();
            }
        }
    }

};
