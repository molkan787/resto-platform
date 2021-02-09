import { PostOrderDTO } from "murew-core/dist/interfaces";
import { Service } from "./service";

export class OrderService extends Service{

    async postOrder(data: ServicePostOrderData){
        const { paymentMethod, note } = data;
        const storeId = this.context.$appService.getActiveStoreId();
        if(!storeId) return null;
        const { cart, checkout } = this.state;
        const orderData: PostOrderDTO = {
            store_id: storeId,
            order_total: this.getters.orderTotal,
            cart: cart,
            note,
            checkout
        }
        const resp = await this.$strapi.$http.$post('/postorder', orderData);
        this.state.cart.products = {};
        return resp;
    }

}

export interface ServicePostOrderData{
    paymentMethod: string;
    note: string;
}