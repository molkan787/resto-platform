import { Address } from "./Address";
import { OfferOptions } from "./OfferOptions";

export interface Checkout{
    delivery_address: Address;
    promo_code: string;
    offerOptions: OfferOptions;
    offerOptionsError: String | null;
}