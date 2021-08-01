'use strict';
const { TextUtils } = require('murew-core');

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
            const result = await analyzeBookingUpdate(booking, data);
            console.log('result', result);
            const { canUpdate, requireBookedSlotsUpdate, issue } = result;
            if(!canUpdate){
                throw new Error(issue);
            }
            if(requireBookedSlotsUpdate){
                await strapi.plugins.booking.services.bookedslots.removeBooking(booking);
                await strapi.plugins.booking.services.bookedslots.addBooking(data);
            }
            const currentStatus = booking.status;
            const newStatus = data.status;
            if(currentStatus !== newStatus){
                if(newStatus === 'booked'){
                    await strapi.plugins.booking.services.bookedslots.addBooking(booking);
                }else if(newStatus === 'canceled'){
                    await strapi.plugins.booking.services.bookedslots.removeBooking(booking);
                }
            }

        },
        async beforeDelete(params){
            const booking = await strapi.query('booking', 'booking').findOne(params);
            if(booking.status !== 'canceled'){
                await strapi.plugins.booking.services.bookedslots.removeBooking(booking);
            }
        }
    }

};

/**
 * @returns {{ canUpdate: boolean, requireBookedSlotsUpdate?: boolean, issue?: string }}
 */
async function analyzeBookingUpdate(oldData, newData){
    const { date: old_date, time: _old_time, number_of_persons: old_number_of_persons } = oldData;
    const { store_id, date, time: _time, number_of_persons } = newData;
    const time = _time.substr(0, 5);
    const old_time = _old_time.substr(0, 5);
    const isSameSlot = old_date === date && old_time === time;
    if(isSameSlot && parseInt(old_number_of_persons) === parseInt(number_of_persons)){
        return {
            canUpdate: true,
            requireBookedSlotsUpdate: false
        };
    }
    const store = await strapi.query('store').findOne({ id: store_id });
    if(!store) throw new Error('Invalid store id');
    const { booking_slots, number_of_tables, number_of_people_per_table } = store;
    const dayName = TextUtils.getDayNameFromDate(new Date(`${date} 03:00:00`));
    const daySlot = (booking_slots || []).find(ds => ds.day === dayName);
    if(!daySlot){
        return {
            canUpdate: false,
            issue: `There is no booking slots available for date "${new Date(date).toLocaleDateString()}"`
        }
    }
    const { time_slots } = daySlot;
    const tst = time_slots.map(ts => ts.time.substr(0, 5));
    const timeExist = tst.includes(time);
    if(!timeExist){
        return {
            canUpdate: false,
            issue: `The selected time does not exist as booking slot, Available slots are ${tst.join(', ')}`
        }
    }

    const bookedTables = Math.ceil(old_number_of_persons / number_of_people_per_table);
    const neededTables = Math.ceil(number_of_persons / number_of_people_per_table);
    const tablesDiffrence = neededTables - bookedTables;

    if(tablesDiffrence > 0){
        const [ bookedSlot ] = await strapi.plugins.booking.services.bookedslots.getBookedSlots(date, date, store_id);
        const takedTables = bookedSlot ? bookedSlot.tables : 0;
        const freeTables = number_of_tables - takedTables;
        if(tablesDiffrence > freeTables){
            return {
                canUpdate: false,
                issue: `There isn't enough free tables for the selected date & time`
            }
        }else{
            return {
                canUpdate: true,
                requireBookedSlotsUpdate: true
            }
        }
    }else{
        return {
            canUpdate: true,
            requireBookedSlotsUpdate: !isSameSlot || (tablesDiffrence !== 0) // either date/time changed or the booking require less tables than previously
        };
    }
}

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