'use strict';

const XlBuilder = require("../helpers/xlBuilder");

/**
 * reports.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

module.exports = {
    async generateReports(_dateFrom, _dateTo){
        const dateFrom = new Date(_dateFrom);
        const dateTo = new Date(_dateTo);
        const orders = await strapi.query('order').find({
            createdAt_gte: dateFrom,
            createdAt_lte: dateTo,
            status: 'delivered'
        })
        const totals = orders.reduce((ts, order) => (ts[order.type] += order.total) && ts, { delivery: 0, collection: 0 });
        const paymentMethods = {
            cod: 'Cash on Delivery',
            online_card: 'Debit/Credit Card'
        };
        const xl = new XlBuilder('Sales Reports');
        xl.head([
            'Order #', 2,
            'Date', 5,
            'Type', 2,
            'Value', 2,
            'Payment Method', 4,
        ], XlBuilder.HEADINPUT_ALLINONE, []);
        xl.addItems(orders, [
            { p: 'no', f: 'str' },
            { p: 'createdAt', f: 'str' },
            { p: 'type', f: 'str' },
            { p: 'total', f: 'price' },
            { p: 'payment_method', f: 'str' },
        ], {
            formaters: {
                createdAt: d => d.toLocaleString(),
                type: t => typeof t == 'string' ? (t.charAt(0).toUpperCase() + t.substr(1)) : '---',
                payment_method: pm => paymentMethods[pm] || pm
            },
            sums: [
                { col: 4, style: 'priceBold', prefix: 'Totals:' },
            ]
        });
        xl.c_row = 1;
        xl.c_col = 8;
        for(const name of Object.keys(totals)){
            xl.ws.column(xl.c_col).setWidth(name.length * 2);  
            xl.str(`Total ${name.charAt(0).toUpperCase()+name.substr(1)}`).style(xl.styles.head);
        }
        xl.nextRow();
        xl.c_col = 8;
        for(const val of Object.values(totals)){
            xl.price(val); 
        }
        const buffer = await xl.writeToBuffer();
        return new Buffer(buffer, 'binary');
    }
};
