'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {

    lifecycles: {
        beforeCreate(data){
            return fillAdditionalBookingData(data, true);
        },
        async afterCreate(data){
            strapi.services.notifier.sendBookingConfirmation(data.owner, data);
            await strapi.plugins.booking.services.bookedslots.addBooking(data);
        },
        async beforeUpdate(params, data){
            await fillAdditionalBookingData(data);
            const booking = await strapi.query('booking', 'booking').findOne(params);
            const currentStatus = booking.status;
            const newStatus = data.status;
            if(currentStatus !== newStatus){
                if(newStatus === 'booked'){
                    await strapi.plugins.booking.services.bookedslots.addBooking(booking);
                }else if(newStatus === 'canceled'){
                    await strapi.plugins.booking.services.bookedslots.removeBooking(booking);
                }
            }
        }
    }

};


async function fillAdditionalBookingData(data, assignRefNo){
    const { owner } = data;
    if(typeof owner == 'string' && owner.length > 10){
        const user = await strapi.query('user', 'users-permissions').findOne({ id: owner });
        if(user){
            const { fullname, phone } = user;
            data.customer_name = fullname;
            data.customer_phone = phone;
        }
    }
    if(!data.status) data.status = 'booked';
    if(assignRefNo){
        data.no = await strapi.services.metadata.generateReferenceNumber('booking', 'NB');
    }
    return data;
}