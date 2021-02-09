import { Offer } from "./interfaces";
import { Cart, CartItem, CartProductOptions, CartProducts } from "./interfaces/Cart";
import { Product } from "./interfaces/Product";
import { OfferUtils } from "./OfferUtils";
import { OrderType } from "./types";
import { ProductsMap } from "./types/ProductsMap";

export class CartUtils {

    /**
     * Calculates total order value 
     */
    static calcOrderTotal(cart: Cart, products: ProductsMap, offer: Offer | null): number {
        const { orderType, delivery } = cart;
        let total = this.calcProductsTotal(cart.products, products);
        total += OfferUtils.getOfferDiscountAmount(offer, total);
        total += orderType == OrderType.Delivery ? delivery : 0;
        return total;
    }

    /**
     * Calculates the total value of the cart's selected products
     */
    static calcProductsTotal(cartProducts: CartProducts, products: ProductsMap): number {
        const items = this.getCartItems(cartProducts, products);
        return items.reduce((total, item) => total + item.total, 0);
    }

    /**
     * Formats cart items into an object containing all necessary information (Product's info, selected quantity, unit price...)
     */
    static getCartItems(cartProducts: CartProducts, products: ProductsMap): CartItem[] {
        return <CartItem[]>Object.entries(cartProducts).map(([id, options]) => {
            const product = products.get(id);
            if(!product) return null;
            return {
                id,
                data: product,
                qty: options.qty,
                total: this.calcItemTotal(product, options)
            }
        }).filter(i => !!i);
    }

    /**
     * Calculates cart's item total value, including the choosen extras and selected quantity.
     */
    static calcItemTotal(product: Product, options: CartProductOptions){
        const extrasCost = options.extras.reduce((t, e) => t + e.price, 0);
        const unitPrice = product.price + extrasCost;
        return unitPrice * options.qty;
    }


}