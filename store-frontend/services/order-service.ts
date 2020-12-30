import { Service } from "./service";

export class OrderService extends Service{

    async postOrder(data: any){
        const { address, paymentMethod, note } = data;
        const { products, orderType } = this.state.cart;
        const items = Object.entries(products)
                            .map(([id, options]) => ({
                                id,
                                quantity: options.qty,
                                note: options.note,
                                extras: options.extras
                            }));
        const storeId = this.context.$appService.getActiveStoreId();
        const resp = await this.$strapi.$http.$post('/postorder', {
            store_id: storeId,
            type: orderType,
            items,
            delivery_address: address,
            note,
        });
        this.state.cart.products = {};
        return resp;
    }

}