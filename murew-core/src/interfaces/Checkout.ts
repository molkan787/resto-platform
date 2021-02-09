import { Address } from "./Address";
import { OfferOptions } from "./OfferOptions";

export interface Checkout{
    delivery_address: Address;
    offerOptions: OfferOptions;
    offerOptionsError: String | null;
}