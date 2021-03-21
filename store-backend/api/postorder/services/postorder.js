'use strict';
const { sanitizeEntity } = require('strapi-utils');
const { MurewMenu } = require('../../../constants/murew');
const BadRequestError = require('../../../errors/BadRequestError');
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
        const { cart, checkout, note, store_id, order_total, payment_method } = data;
        const { delivery_address, offerOptions, preorder } = checkout;
        const { products: items, orderType: type, selectedOffer } = cart;
        const isOnlinePayment = payment_method === 'online_card';
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
            status: 'pending',
            total: orderTotal,
            created_by: user.id,
            owner: user.id,
            menu: allHaveRemoteId ? MurewMenu.POS : MurewMenu.ONLINE,
            note,
            delivery_address: isDelivery ? delivery_address : {},
            payment_method: payment_method,
            attrs: {
                delivery_cost: cart.delivery
            },
            no: await this.generateOrderNumber(),
        }

        const { enabled, date, time } = preorder;
        if(enabled && typeof date == 'string' && typeof time == 'string'){
            order.preorder = {
                enabled: true,
                date: new Date(date).toISOString().split('T')[0],
                time: time.split(':').slice(0, 2).concat(['00.000']).join(':')
            }
        }

        if(isDelivery){
            await strapi.query('user', 'users-permissions').update({ id: user.id }, { default_address: delivery_address });
        }
        const _order = await this.createOrderEntry(order);
        await this.alterStock(productsItems, -1);

        const sanitizedOrderData = sanitizeEntity(_order, { model: strapi.models.order });
        const response = {
            order: sanitizedOrderData,
            payment_intent: {
                client_secret: ''
            }
        }
        if(isOnlinePayment){
            const paymentIntent = await strapi.services.payment.createPaymentIntent(_order);
            response.payment_intent.client_secret = paymentIntent.client_secret;
        }else{
            await this.confirmPendingOrder(_order);
        }

        return response;
    }

    static async confirmOrderPayment(orderId){
        const orderQuery = strapi.query('order');
        const paymentQuery = strapi.query('payment');
        const order = await orderQuery.findOne({ id: orderId });
        const payment = await paymentQuery.findOne({ order_id: orderId });
        if(!order) throw new Error('Order not found');
        if(!payment) throw new Error('Payment not found');
        if(order.status !== 'pending') throw new Error('Order already processed');
        if(payment.status !== 'requires_payment_method') throw new Error('Payment already processed be confirmed');
        const paymentSucceeded = await strapi.services.payment.confirmPayment(payment);
        if(paymentSucceeded){
            await this.confirmPendingOrder(order);
        }
        return {
            success: paymentSucceeded
        }
    }

    static async confirmPendingOrder(order){
        if(typeof order == 'string'){
            order = await strapi.query('order').findOne({ id: order });
        }
        await strapi.query('order').update({ id: order.id }, { status: 'placed' });
        order.status = 'placed';
        const sanitizedOrderData = sanitizeEntity(order, { model: strapi.models.order });
        try {
            strapi.services.posSyncService.sendOrder(sanitizedOrderData);
            await strapi.services.notifier.sendOrderStatusUpdate(order.owner, order);
        } catch (error) {
            console.error(error);
        }
    }

    static createOrderEntry(order){
        return strapi.query('order').create(order);
    }

    static async setOrderStatus(data, status){
        const { id: orderId, ready_time } = data;
        const _order = await strapi.query('order').findOne({ _id: orderId });
        const order = await strapi.query('order').update({ _id: orderId }, { status });
        if(['declined', 'canceled'].includes(status)){
            const { products } = order;
            await this.alterStock(products, 1);
        }
        if(order.status != _order.status){
            _order.status = status;
            try {
                await strapi.services.notifier.sendOrderStatusUpdate(order.owner, _order, ready_time);
            } catch (error) {
                console.error(error);
            }
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
        return await strapi.services.metadata.generateReferenceNumber('order', 'N');
    }

    /**
     * 
     * @param {Interfaces.PostOrderDTO} data 
     */
    static validateData(data){
        const { cart, checkout, payment_method } = data;
        const { delivery_address } = checkout;
        const { products, orderType } = cart;
        if(!['cod', 'online_card'].includes(payment_method)){
            throw new BadRequestError(`Invalid payment method "${payment_method}"`);
        }
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
        const error = offer && OfferUtils.validateOffer(offer, cart, checkout, productsTotal, products);
        if(error){
            throw new BadRequestError(error);
        }
    }
    
}