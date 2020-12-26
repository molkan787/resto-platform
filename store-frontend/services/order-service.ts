import { Service } from "./service";

export class OrderService extends Service{

    async postOrder(){
        const items = Object.entries(this.state.cart.products)
                            .map(([id, qty]) => ({
                                id,
                                quantity: qty,
                                note: ''
                            }));

        const resp = await this.$strapi.$http.$post('/postorder', {
            type: 'collection',
            items
        });
        this.state.cart.products = {};
    }

}