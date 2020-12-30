import { Service } from "./service";
import Vue from 'vue';
import { Product } from "~/interfaces/Product";
import { CartProductOptions } from "~/interfaces/CartProductOptions";

export class CartService extends Service{

    public setProduct(productId: string, options: CartProductOptions){
        Vue.set(this.state.cart.products, productId, options);
    }

    public removeProduct(productId: string){
        Vue.delete(this.state.cart.products, productId);
    }

    public adjustProductQuantity(productId: string, amount: number){
        const product = this.state.products.get(productId);
        const options = this.state.cart.products[productId];
        let qty = options.qty;
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
            Vue.set(options, 'qty', qty);
        }else{
            this.removeProduct(productId);
        }
    }

    public getItemOptions(productId: string){
        return this.state.cart.products[productId] || null;
    }
}