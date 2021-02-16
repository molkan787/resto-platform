'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {

    lifecycles: {
        beforeCreate(data){
            return fillCustomerData(data);
        },
        beforeUpdate(params, data){
            return fillCustomerData(data);
        }
    }

};


async function fillCustomerData(data){
    const { owner } = data;
    if(typeof owner == 'string' && owner.length > 10){
        const user = await strapi.query('user', 'users-permissions').findOne({ id: owner });
        if(user){
            const { fullname, phone } = user;
            data.customer_name = fullname;
            data.customer_phone = phone;
        }
    }
    return data;
}