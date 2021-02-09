import { OrderType } from "../types";
import { Product } from "./Product";

export interface Cart{
    products: CartProducts;
    orderType: OrderType;
    delivery: number;
    selectedOffer: String | null;
}

export interface CartProducts{
    [productId: string]: CartProductOptions;
}

export interface CartProductOptions{
    note: string;
    qty: number;
    extras: any[];
}
export interface CartItem{
    id: string;
    data: Product;
    qty: number;
    total: number;
}