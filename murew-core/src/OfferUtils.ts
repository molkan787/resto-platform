import { Cart, Checkout, Offer, OfferBenefitFreeItems, OfferBenefitPercentDiscount, OfferGetType, } from "./interfaces";
import { OfferOptions } from "./interfaces/OfferOptions";
import { ProductsMap } from "./types";
import { arrayToMap, getMapItems } from "./DataUtils";
import { formatPrice, itemsText } from "./TextUtils";
import { fixDecimals } from "./MathUtils";

export class OfferUtils {

    static discountCodeOffer(discountCode: string, percentAmount: number): Offer {
        const benefit: OfferBenefitPercentDiscount = {
            type: OfferGetType.PercentDiscount,
            percent_amount: percentAmount
        }
        return {
            id: OfferGetType.DiscountCode,
            name: `Discount Code (${discountCode})`,
            available_on_delivery: true,
            available_on_pickup: true,
            available_on_website: true,
            available_on_pos: true,
            condition: {
                minimum_items_count: 0,
                minimum_order_value: 0
            },
            benefits: [benefit],
            activated_by_promo_code: true,
            promo_code: discountCode
        }
    }

    static getEligibleOffers(offers: Offer[], cart: Cart, productsTotal: number): Offer[] {
        return offers.filter(offer => this.isOfferEligible(offer, cart, productsTotal));
    }

    static isOfferEligible(offer: Offer, cart: Cart, productsTotal: number): boolean {
        const { orderType, products } = cart;
        const { available_on_delivery, available_on_pickup, condition, expires } = offer;
        const { minimum_order_value, minimum_items_count } = condition;
        const itemsIds = Object.keys(products);

        if(orderType == 'delivery' && !available_on_delivery) return false;
        if(orderType == 'collection' && !available_on_pickup) return false;

        if(itemsIds.length < minimum_items_count) return false;
        if(productsTotal < minimum_order_value) return false;

        if(typeof expires == 'string'){
            const expiresDate = new Date(expires);
            const expired = expiresDate < new Date();
            if(expired) return false;
        }

        return true;
    }

    static getOfferDiscountAmount(offer: Offer | null, total: number): number {
        if(!offer) return 0;
        const { benefits } = offer;
        const benefit = benefits[0];
        if(!benefit) return 0;
        const { type } = benefit;
        if(type == OfferGetType.PercentDiscount){
            const amt = (<OfferBenefitPercentDiscount>benefit).percent_amount * total / -100
            return fixDecimals(amt, 2);
        }
        return 0;
    }

    static validateOfferOptions(offer: Offer, options: OfferOptions, products: ProductsMap): string | null {
        const { selectedItems } = options;
        const { benefits } = offer;
        const benefit = benefits[0];
        if(benefit.type == OfferGetType.FreeItems){
            const { max_items, max_value, items, all_items } = <OfferBenefitFreeItems>benefit;
            const selectedProducts = getMapItems(products, selectedItems);
            
            if(selectedProducts.length > max_items)
                return `A maximum of ${itemsText(max_items, 'Product', 'Products')} can be selected.`;

            if(max_value > 0){
                const totalValue = selectedProducts.reduce((total, product) => total + product.price, 0);
                if(totalValue > max_value)
                    return `The total value of the selected products cannot exceed ${formatPrice(max_value)}`;
            }

            if(!all_items){
                const availableProducts = arrayToMap(items, 'id');
                const notOffereditems = selectedItems.filter((id) => !availableProducts.get(id));
                if(notOffereditems.length){
                    return `The selected products are not included in the offer.`;
                }
            }
        }
        return null;
    }

    static validateOffer(offer: Offer, cart: Cart, checkout: Checkout, productsTotal: number, products: ProductsMap): string | null{
        if(!this.isOfferEligible(offer, cart, productsTotal)){
            return `Offer "${offer.name}" isn't eligible on this order`;
        }
        return this.validateOfferOptions(offer, checkout.offerOptions, products);
    }

}