'use strict';
const { sanitizeEntity } = require('strapi-utils');
const BadRequestError = require('../../../errors/BadRequestError');

module.exports = class PostOrderService{

    static async createOrder(data, user){
        const { type, items } = data;
        this.validateData(type, items);
        const products_ids = items.map(item => item.id);
        const products = await this.fetchProducts(products_ids);
        const productsItems = this.fillProductsInfo(items, products);
        const order = {
            type,
            products: productsItems,
            status: 'placed',
            total: this.calculateOrderTotal(productsItems),
            created_by: user.id,
            owner: user.id
        }
        const _order = await this.createOrderEntry(order);
        const sanitizedOrderData = sanitizeEntity(_order, { model: strapi.models.order });
        strapi.services.posSyncService.sendOrder(sanitizedOrderData);
        return sanitizedOrderData;
    }

    static createOrderEntry(order){
        return strapi.query('order').create(order);
    }

    static fillProductsInfo(items, products){
        const productsMap = products.reduce((m, p) => (m[p.id] = p) && m, {});
        const result = [];
        for(let item of items){
            const { id, quantity, note } = item;
            const p = productsMap[id];
            if(!p) continue;
            const { name, price, updated_at} = p;
            result.push({
                id,
                quantity,
                note,
                name,
                price,
                version_date: updated_at
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
    
    static fetchProducts(ids){
        return strapi.query('product').find({
            id_in: ids
        }, []);
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