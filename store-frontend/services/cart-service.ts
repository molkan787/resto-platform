import { Service } from "./service";
import Vue from 'vue';
import { CartProductOptions } from "~/interfaces/CartProductOptions";
import { CART_LS_KEY } from "./constants";

export class CartService extends Service{

    public setProduct(productId: string, options: CartProductOptions){
        Vue.set(this.state.cart.products, productId, options);
        this.saveCart();
    }

    public removeProduct(productId: string){
        Vue.delete(this.state.cart.products, productId);
        this.saveCart();
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
        this.saveCart();
    }

    public getItemOptions(productId: string){
        return this.state.cart.products[productId] || null;
    }

    public clearCart(){
        this.state.cart.products = {};
        this.saveCart();
    }

    public saveCart(){
        const { cart, activeStore } = this.state;
        const data = {
            cart,
            store_id: activeStore?.id,
        };
        const strData = JSON.stringify(data);
        window.localStorage.setItem(CART_LS_KEY, strData);
    }

    public loadCart(){
        const raw = window.localStorage.getItem(CART_LS_KEY);
        if(!raw) return;
        const { cart, store_id } = JSON.parse(raw);
        if(store_id === this.state.activeStore?.id){
            this.state.cart = cart;
        }
    }


}