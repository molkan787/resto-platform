import { Context } from '@nuxt/types';
import { Category } from '~/interfaces/Category';
import { LayoutSettings } from '~/interfaces/LayoutSettings';
import { Page } from '~/interfaces/Page';
import { Store } from '~/interfaces/Store';
import { StoreSettings } from '~/interfaces/StoreSettings';
import { Cart, CartProductOptions, Checkout, Offer, Product } from 'murew-core/dist/interfaces';
import { CartUtils, OfferUtils } from 'murew-core';
import { OrderType } from 'murew-core/dist/types';

export const strict = false;

export const state = () => ({
    activeStore: <Store | null>null,
    stores: <Store[]>[],
    layoutSettings: <LayoutSettings>{},
    storeSettings: <StoreSettings>{},
    pages: <Page[]>[],
    dataLoaded: false,
    categories: <Category[]>[],
    cart: <Cart>{
        products: {},
        orderType: 'delivery',
        delivery: -1,
        selectedOffer: null,
    },
    products: new Map<string, Product>(),
    offers: <Offer[]>[],
    eligibleOffers: <Offer[]>[],
    checkout: <Checkout>{
        delivery_address: {
            line1: '',
            line2: '',
            postcode: '',
            city: '',
        },
        offerOptions: {
            selectedItems: []
        },
        offerOptionsError: null,
    }
});

declare type State = ReturnType<typeof state>;

export const getters = {
    canPostOrder: (state: State, getters: any) => {
        return (
            !state.checkout.offerOptionsError
            && Object.values(state.cart.products).reduce((acc, p) => acc + p.qty, 0) > 0
            && getters.productsTotal >= state.storeSettings.minimum_order_value
        )
    },
    cartItems: ({ cart, products }: State) => CartUtils.getCartItems(cart.products, products),
    
    productsTotal: (state: State, getters: any): number => {
        return getters.cartItems.reduce((t: number, i: any) => t + i.total, 0);
    },
    productsDiscount: (state: State, getters: any) => {
        return OfferUtils.getOfferDiscountAmount(getters.selectedOffer, getters.productsTotal);
    },
    orderTotal: (state: State, getters: any): number => {
        let total = getters.productsTotal;
        total += getters.productsDiscount;
        return total + (
            state.cart.orderType == OrderType.Delivery ? state.cart.delivery : 0
        )
    },
    selectedOffer: (state: State): Offer | null => {
        const { selectedOffer } = state.cart;
        const index = state.offers.findIndex(o => o.id === selectedOffer);
        return state.offers[index] || null;
    }
}

export const actions = {
    async nuxtServerInit({ state }: any, { $strapi }: Context){
        try {
            await Promise.all([
                $strapi.find('stores', { active: true }).then(stores => state.stores = stores),
                $strapi.find('public/frontend-settings').then(({ layout, store, pages }: any) => {
                    state.layoutSettings = layout;
                    state.storeSettings = store;
                    state.pages = pages;
                    bootstrap(state);
                })
            ])
        } catch (error) {
            console.error(error)
        }
    }
};

export function bootstrap(state: State) {
    const { enable_delivery_orders, enable_pickup_orders } = state.storeSettings;
    if(!enable_delivery_orders){
        state.cart.orderType = OrderType.Collection;
    }else if(!enable_pickup_orders){
        state.cart.orderType = OrderType.Delivery;
    }
}