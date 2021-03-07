module.exports = {

    async getBookedSlots(ctx){
        const { month } = ctx.params;
        const { store_id } = ctx.query;
        const [ yyyy, mm ] = month.split('-');
        const lastDayOftheMonth = new Date(parseInt(yyyy), parseInt(mm), 0).getDate();
        const minDate = month + '-01';
        const maxDate = month + '-' + lastDayOftheMonth.toString();
        const bookedSlots = await strapi.plugins.booking.services.bookedslots.getBookedSlots(minDate, maxDate, store_id);
        return bookedSlots;
    }

};