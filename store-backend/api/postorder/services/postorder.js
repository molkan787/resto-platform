'use strict';
const { sanitizeEntity } = require('strapi-utils');
const { MurewMenu } = require('../../../constants/murew');
const BadRequestError = require('../../../errors/BadRequestError');
const { generateOrderNumber } = require('../../../murew-core/utils/order');

module.exports = class PostOrderService{

    static async createOrder(data, user){
        const { type, items } = data;
        this.validateData(type, items);
        const products_ids = items.map(item => item.id);
        const products = await this.fetchProducts(products_ids);
        const productsItems = this.fillProductsInfo(items, products);
        const orderNo = await this.generateOrderNumber();
        const order = {
            no: orderNo,
            type,
            products: productsItems,
            status: 'placed',
            total: this.calculateOrderTotal(productsItems),
            created_by: user.id,
            owner: user.id,
            menu: MurewMenu.ONLINE
        }
        const _order = await this.createOrderEntry(order);
        await this.manageStock(productsItems, -1);
        const sanitizedOrderData = sanitizeEntity(_order, { model: strapi.models.order });
        sanitizedOrderData.menu = MurewMenu.ONLINE;
        strapi.services.posSyncService.sendOrder(sanitizedOrderData);
        return sanitizedOrderData;
    }

    static createOrderEntry(order){
        return strapi.query('order').create(order);
    }

    static async setOrderStatus(orderId, status){
        const order = await strapi.query('order').update({ _id: orderId }, { status });
        if(['declined', 'canceled'].includes(status)){
            const { products } = order;
            await this.manageStock(products, 1);
        }
    }

    static fillProductsInfo(items, products){
        const productsMap = products.reduce((m, p) => (m[p.id] = p) && m, {});
        const result = [];
        for(let item of items){
            const { id, quantity, note } = item;
            const p = productsMap[id];
            if(!p) continue;
            const { name, price, updated_at, enable_stock} = p;
            result.push({
                pid: id,
                quantity: parseInt(quantity),
                note,
                name,
                price,
                version_date: updated_at,
                enable_stock: enable_stock
            })
        }
        return result;
    }

    static calculateOrderTotal(items){
        let total = 0;
        for(let item of items){
            const qty = parseInt(item.quantity);
            const price = item.price;
            const localTotal = price * qty;
            total += localTotal;
        }
        return total;
    }

    static async manageStock(items, direction){
        const eligible = items.filter(item => item.enable_stock);
        const queries = eligible
            .map(item => (
                strapi.query('product').model
                .where({ _id: item.pid })
                .update({
                    $inc: {
                        stock: item.quantity * (direction || -1)
                    }
                })
            ));
        await Promise.all(queries);
    }
    
    static fetchProducts(ids){
        return strapi.query('product').find({
            id_in: ids
        }, []);
    }

    static async generateOrderNumber(){
        const doc = await strapi.query('metadata').model.findOneAndUpdate({}, {
            $inc: {
                order_no_pointer: 1
            }
        });
        const { order_no_pointer } = doc;
        return generateOrderNumber(order_no_pointer, 'N');
    }

    static validateData(type, items){
        if(!['delivery', 'collection'].includes(type)){
            throw new BadRequestError(`Invalid order type "${type}"`);
        }
        if(!(items instanceof Array) || items.length == 0){
            throw new BadRequestError('At least one product should be included');
        }
        return true;
    }
    
}