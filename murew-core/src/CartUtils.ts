import { CategoryContentType, Offer } from "./interfaces";
import { Cart, CartItem, CartProductOptions, CartProducts } from "./interfaces/Cart";
import { Product } from "./interfaces/Product";
import { fixDecimals } from "./MathUtils";
import { OfferUtils } from "./OfferUtils";
import { OrderType } from "./types";
import { ProductsMap } from "./types/ProductsMap";

export class CartUtils {

    /**
     * Calculates total order value 
     */
     static calcOrderTotal(cart: Cart, products: ProductsMap, offer: Offer | null): number {
        return this.calcOrderTotalsValues(cart, products, offer).total;
    }

    /**
     * Calculates total order value 
     */
    static calcOrderTotalsValues(cart: Cart, products: ProductsMap, offer: Offer | null) {
        const { orderType, delivery } = cart;
        let values = this.calcProductsTotal(cart.products, products);
        let total = values.total;
        console.log('total 1:', total)
        const discount = OfferUtils.getOfferDiscountAmount(offer, total);
        const deliveryCost = orderType == OrderType.Delivery ? fixDecimals(delivery, 2) : 0;
        total += discount;
        console.log('total 2:', total)
        total += deliveryCost;
        console.log('total 3:', total)
        return {
            food_total: values.food_total,
            drinks_total: values.drinks_total,
            sub_total: values.total,
            discount: discount,
            delivery_cost: deliveryCost,
            total: fixDecimals(total, 2)
        };
    }

    /**
     * Calculates the total value of the cart's selected products
     */
    static calcProductsTotal(cartProducts: CartProducts, products: ProductsMap) {
        const items = this.getCartItems(cartProducts, products);
        const len = items.length;
        let total = 0, foodTotal = 0, drinksTotal = 0;
        for(let i = 0; i < len; i++){
            const { total: iTotal, data } = items[i];
            total += iTotal;
            const categoryType = typeof data.category == 'object' ? data.category.type : CategoryContentType.Food;
            if(categoryType == CategoryContentType.Food){
                foodTotal += iTotal;
            }else if(categoryType == CategoryContentType.Drinks){
                drinksTotal += iTotal;
            }
        }
        return {
            total: fixDecimals(total, 2),
            food_total: fixDecimals(foodTotal, 2),
            drinks_total: fixDecimals(drinksTotal, 2)
        }
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
        const unitPrice = fixDecimals(product.price + extrasCost, 2);
        return fixDecimals(unitPrice * options.qty, 2);
    }


}