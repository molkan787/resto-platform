import { Address } from "./Address";
import { OfferOptions } from "./OfferOptions";

export interface Checkout{
    delivery_address: Address;
    promo_code: string;
    offerOptions: OfferOptions;
    offerOptionsError: string | null;
    preorder: {
        enabled: boolean;
        date: Date | null;
        time: string;
    };
}