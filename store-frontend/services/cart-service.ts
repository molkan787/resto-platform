import { Service } from "./service";
import Vue from 'vue';

export class CartService extends Service{

    public adjustProductQuantity(productId: number, amount: number){
        const quantities = this.state.cart.products;
        let qty = quantities[productId];
        if(typeof qty == 'number'){
            qty += amount;
        }else{
            qty = amount;
        }

        if(qty < 0) qty = 0;

        if(qty > 0){
            Vue.set(quantities, productId, qty);
        }else{
            Vue.delete(quantities, productId);
        }
    }

}