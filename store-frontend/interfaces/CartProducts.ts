import { CartProductOptions } from "./CartProductOptions";

export interface CartProducts{
    [productId: string]: CartProductOptions;
}