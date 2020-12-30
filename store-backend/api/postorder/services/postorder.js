'use strict';
const { sanitizeEntity } = require('strapi-utils');
const { MurewMenu } = require('../../../constants/murew');
const BadRequestError = require('../../../errors/BadRequestError');
const { generateOrderNumber } = require('../../../murew-core/utils/order');

module.exports = class PostOrderService{

    static async createOrder(data, user){
        const { type, items, delivery_address, note } = data;
        this.validateData(data);
        const isDelivery = type == 'delivery';
        const products_ids = items.map(item => item.id);
        const products = await this.fetchProducts(products_ids);
        const productsItems = this.fillProductsInfo(items, products);
        // throw new Error('foo')
        const orderNo = await this.generateOrderNumber();
        const order = {
            no: orderNo,
            type,
            products: productsItems,
            status: 'placed',
            total: this.calculateOrderTotal(productsItems),
            created_by: user.id,
            owner: user.id,
            menu: MurewMenu.ONLINE,
            note,
            delivery_address: isDelivery ? delivery_address : {}
        }
        if(isDelivery){
            await strapi.query('user', 'users-permissions').update({ id: user.id }, { default_address: delivery_address });
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
            const extras_ids = item.extras.map(e => e.id);
            console.log(id, extras_ids)
            const p = productsMap[id];
            if(!p) continue;
            const { name, price, updated_at, enable_stock, extras: extras_av } = p;
            const extras = extras_av.filter(ea => extras_ids.includes(ea.id)).map(e => ({
                name: e.name,
                price: e.price,
            }));
            const unit_price = extras.reduce((t, e) => t + e.price, price);
            result.push({
                pid: id,
                quantity: parseInt(quantity),
                note,
                name,
                price,
                unit_price: unit_price,
                extras,
                enable_stock: enable_stock
            })
        }
        return result;
    }

    static calculateOrderTotal(items){
        let total = 0;
        for(let item of items){
            const qty = parseInt(item.quantity);
            const localTotal = item.unit_price * qty;
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

    static validateData(data){
        const { type, items, delivery_address } = data;
        if(!['delivery', 'collection'].includes(type)){
            throw new BadRequestError(`Invalid order type "${type}"`);
        }
        if(!(items instanceof Array) || items.length == 0){
            throw new BadRequestError('At least one product should be included');
        }
        if(type == 'delivery' && typeof delivery_address != 'object'){
            throw new BadRequestError('Please provide delivery address');
        }
        return true;
    }
    
}