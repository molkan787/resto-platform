import { Product } from "./Product";

export interface Offer{
    id?: string;
    name: string;
    expires?: Date;
    condition: OfferCondition;
    available_on_delivery: boolean;
    available_on_pickup: boolean;
    available_on_website: boolean;
    available_on_pos: boolean;
    benefits: OfferBenefit[];
}

export interface OfferCondition{
    minimum_order_value: number;
    minimum_items_count: number;
}

export interface OfferBenefitPercentDiscount extends OfferBenefit {
    type: OfferGetType.PercentDiscount;
    percent_amount: number;
}

export interface OfferBenefitFreeItems extends OfferBenefit {
    type: OfferGetType.FreeItems;
    all_items: boolean;
    items: Product[];
    max_items: number;
    max_value: number;
}

export interface OfferBenefit{
    type: OfferGetType;
}

export enum OfferGetType{
    PercentDiscount = 'percent_discount',
    FreeItems = "free_items",
    DiscountCode = "discount_code",
}