import { Cart } from "./Cart";
import { Checkout } from "./Checkout";

export interface PostOrderDTO{
    store_id: string;
    order_total: number;
    cart: Cart;
    note: string;
    checkout: Checkout;
}