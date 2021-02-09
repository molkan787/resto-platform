'use strict';
const { sanitizeEntity } = require('strapi-utils');
const { MurewMenu } = require('../../../constants/murew');
const BadRequestError = require('../../../errors/BadRequestError');
const { generateOrderNumber } = require('../../../murew-core/utils/order');
const { Interfaces, OfferUtils, Types, CartUtils } = require('murew-core');
const { arrayToMap } = require('murew-core/dist/DataUtils');
const { OrderType } = require('murew-core/dist/types');

module.exports = class PostOrderService{

    /**
     * 
     * @param {Interfaces.PostOrderDTO} data 
     * @param {any} user 
     */
    static async createOrder(data, user){
        const { cart, checkout, note, store_id, order_total } = data;
        const { delivery_address, offerOptions } = checkout;
        const { products: items, orderType: type, selectedOffer } = cart;
        this.validateData(data);
        const store = await strapi.query('store').findOne({ id: store_id, active: true });
        if(!store){
            throw new BadRequestError(`Store with id "${store_id}" not found.`);
        }
        const offer = selectedOffer ? await strapi.query('offer').findOne({ id: selectedOffer }) : null;
        const isDelivery = type == OrderType.Delivery;
        const products_ids = Object.keys(items).concat(offerOptions.selectedItems);
        const products = await this.fetchProducts(products_ids, store_id);
        const productsMap = arrayToMap(products, 'id');
        const productsTotal = CartUtils.calcProductsTotal(items, productsMap);
        this.validateOrder(data, productsMap, productsTotal, offer);
        const orderTotal = CartUtils.calcOrderTotal(cart, productsMap, offer);
        if(orderTotal != order_total){
            throw new BadRequestError('Prices may have changed, Please try reloading the page. Error: TNET');
        }

        const productsItems = this.fillProductsInfo(items, productsMap);
        const offerItems = this.fillOfferProductsInfo(offerOptions.selectedItems, productsMap)
        const orderItems = productsItems.concat(offerItems);
        const allHaveRemoteId = orderItems.reduce((b, p) => b && !!p.remote_id, true);

        if(offer){
            const discount = OfferUtils.getOfferDiscountAmount(offer, productsTotal);
            if(discount < 0){
                orderItems.push({
                    pid: 'discount',
                    quantity: 1,
                    note: '',
                    name: offer.name,
                    price: discount,
                    unit_price: discount,
                    extras: [],
                    enable_stock: false,
                    remote_id: null
                })
            }
        }

        const order = {
            store_id: store_id,
            type,
            products: orderItems,
            status: 'placed',
            total: orderTotal,
            created_by: user.id,
            owner: user.id,
            menu: allHaveRemoteId ? MurewMenu.POS : MurewMenu.ONLINE,
            note,
            delivery_address: isDelivery ? delivery_address : {},
            payment_method: 'cod',
            no: await this.generateOrderNumber(),
        }
        if(isDelivery){
            await strapi.query('user', 'users-permissions').update({ id: user.id }, { default_address: delivery_address });
        }
        const _order = await this.createOrderEntry(order);
        await this.alterStock(productsItems, -1);
        const sanitizedOrderData = sanitizeEntity(_order, { model: strapi.models.order });
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
            await this.alterStock(products, 1);
        }
    }

    /**
     * 
     * @param {Interfaces.CartProducts} items 
     * @param {Types.ProductsMap} productsMap 
     */
    static fillProductsInfo(items, productsMap){
        const result = [];
        for(let [id, options] of Object.entries(items)){
            const { qty, note } = options;
            const extras_ids = options.extras.map(e => e.id);
            const p = productsMap.get(id);
            if(!p) continue;
            const { name, price, enable_stock, extras: extras_av } = p;
            const extras = extras_av.filter(ea => extras_ids.includes(ea.id)).map(e => ({
                name: e.name,
                price: e.price,
            }));
            const unit_price = extras.reduce((t, e) => t + e.price, price);
            result.push({
                pid: id,
                quantity: parseInt(qty),
                note,
                name,
                price,
                unit_price: unit_price,
                extras,
                enable_stock: enable_stock,
                remote_id: p.remote_id
            })
        }
        return result;
    }

    /**
     * 
     * @param {String[]} items 
     * @param {Types.ProductsMap} productsMap 
     */
    static fillOfferProductsInfo(items, productsMap){
        const result = [];
        for(let id of items){
            const p = productsMap.get(id);
            if(!p) continue;
            const { name, price, enable_stock } = p;
            result.push({
                pid: id,
                quantity: 1,
                note: '',
                name: name + ' (Offer)',
                price,
                unit_price: 0,
                extras: [],
                enable_stock: enable_stock,
                remote_id: p.remote_id
            })
        }
        return result;
    }

    static async alterStock(items, direction){
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
    
    /**
     * @param {String[]} ids 
     * @param {String} store_id 
     * @returns {Interfaces.Product[]}
     */
    static fetchProducts(ids, store_id){
        return strapi.query('product').find({
            id_in: ids,
            store_id: store_id,
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

    /**
     * 
     * @param {Interfaces.PostOrderDTO} data 
     */
    static validateData(data){
        const { cart, checkout } = data;
        const { delivery_address } = checkout;
        const { products, orderType } = cart;
        if(!['delivery', 'collection'].includes(orderType)){
            throw new BadRequestError(`Invalid order type "${orderType}"`);
        }
        if(typeof products !== 'object' || Object.keys(products).length == 0){
            throw new BadRequestError('At least one product should be included');
        }
        if(orderType == 'delivery' && typeof delivery_address != 'object'){
            throw new BadRequestError('Please provide delivery address');
        }
        return true;
    }


    /**
     * 
     * @param {Interfaces.PostOrderDTO} data 
     * @param {Types.ProductsMap} products 
     * @param {Number} productsTotal 
     * @param {Interfaces.Offer} offer 
     */
    static validateOrder(data, products, productsTotal, offer){
        const { cart, checkout } = data;
        const error = OfferUtils.validateOffer(offer, cart, checkout, productsTotal, products);
        if(error){
            throw new BadRequestError(error);
        }
    }
    
}