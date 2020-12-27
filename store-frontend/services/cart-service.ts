import { Service } from "./service";
import Vue from 'vue';

export class CartService extends Service{

    public adjustProductQuantity(productId: number, amount: number){
        const product = this.state.products.get(productId);
        const quantities = this.state.cart.products;
        let qty = quantities[productId];
        if(typeof qty == 'number'){
            qty += amount;
        }else{
            qty = amount;
        }

        if(qty < 0) qty = 0;
        if(product?.enable_stock && product.stock < qty){
            qty = product.stock;
        }

        if(qty > 0){
            Vue.set(quantities, productId, qty);
        }else{
            Vue.delete(quantities, productId);
        }
    }

}