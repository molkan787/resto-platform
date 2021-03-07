'use strict';

/**
 * bookedSlots.js service
 */

module.exports = {

    async getBookedSlots(minDate, maxDate, store_id){
        const query = strapi.query('booked-slots', 'booking');
        const bookedSlots = await query.model.find({
            store_id: store_id,
            date: {
                $gte: minDate,
                $lte: maxDate
            }
        });
        const result = [];
        const len = bookedSlots.length;
        for(let i = 0; i < len; i++){
            const { date, time, tables } = bookedSlots[i];
            if(tables > 0){
                result.push({
                    date: date,
                    time: time.split(':').slice(0, 2).join(':'),
                    tables: tables
                });
            }
        }
        return result;
    },

    async addBooking(booking){
        const { store_id, date, time, number_of_persons } = booking;
        const query = strapi.query('booked-slots', 'booking');
        const store = await strapi.query('store').findOne({ id: store_id });
        if(!store) return;
        const { number_of_people_per_table } = store;
        const bookedTables = Math.ceil(number_of_persons / number_of_people_per_table);
        const bookedSlot = await query.findOne({ date, time, store_id });
        if(bookedSlot){
            await query.model.updateOne(
                { _id: bookedSlot._id },
                {
                    $inc: {
                        tables: bookedTables
                    }
                }
            )
        }else{
            await query.create({
                date: date,
                time: time,
                tables: bookedTables,
                store_id: store_id
            })
        }
    },

    async removeBooking(booking){
        const { store_id, date, time, number_of_persons } = booking;
        const query = strapi.query('booked-slots', 'booking');
        const store = await strapi.query('store').findOne({ id: store_id });
        if(!store) return;
        const { number_of_people_per_table } = store;
        const bookedTables = Math.ceil(number_of_persons / number_of_people_per_table);
        const bookedSlot = await query.findOne({ date, time, store_id });
        if(bookedSlot){
            await query.model.updateOne(
                { _id: bookedSlot._id },
                {
                    $inc: {
                        tables: -bookedTables
                    }
                }
            )
        }
    }

};
