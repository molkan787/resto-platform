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
            checkout,
            payment_method: paymentMethod
        }
        const resp = await this.$strapi.$http.$post('/postorder', orderData);
        return resp;
    }

    async confirmOrderPayment(orderId: string){
        const { success } = await this.$strapi.$http.$post(`/confirm_order_payment/${orderId}`, {});
        return success;
    }

}

export interface ServicePostOrderData{
    paymentMethod: string;
    note: string;
}