'use strict';

const { DateUtils } = require('murew-core');

module.exports = {

    async getPlatformFeeAmount(paymentNetAmount){
        const plan = await strapi.services.shared.getVendorPlan();
        let fee = 0;
        if(plan.plan == 'monthly_fee'){
            // const due = await this.getThisMonthDue(plan);
            // fee = paymentNetAmount / 2;
            // if(fee > due){
            //     fee = due;
            // }
            fee = 0;
        }else if(plan.plan == 'percentage'){
            fee = paymentNetAmount * plan.amount / 100;
        }
        if(fee < 0) fee = 0;
        return Math.round(fee * 100) / 100; // rouding to last 2 decimals
    },

    async getThisMonthDue(plan){
        const month = DateUtils.getCurrentMonthValue();
        const ppa = await strapi.query('platform-paid-amounts').findOne({
            month: month
        });
        const totalDue = plan.amount * 100 || 0;
        return totalDue - ( (ppa || {}).paid_amount || 0 );
    },

    async addThisMonthPaidAmount(amount){
        const month = DateUtils.getCurrentMonthValue();
        await this.addPaidAmount(month, amount);
    },

    async addPaidAmount(month, amount){
        const { model } = await strapi.query('platform-paid-amounts');
        await model.updateOne({
            month: month,
        }, {
            $inc: { paid_amount: parseFloat(amount) }
        }, {
            upsert: true
        });
    }

};
