import { Context } from '@nuxt/types';
import { Category } from '~/interfaces/Category';
import { LayoutSettings } from '~/interfaces/LayoutSettings';
import { Page } from '~/interfaces/Page';
import { Store } from '~/interfaces/Store';
import { StoreSettings } from '~/interfaces/StoreSettings';
import { Cart, Checkout, DateTimeSlot, Offer, Product } from 'murew-core/dist/interfaces';
import { CartUtils, OfferUtils } from 'murew-core';
import { OrderType } from 'murew-core/dist/types';
import { getDayNameFromDate } from 'murew-core/dist/TextUtils';

export const strict = false;

export const state = () => ({
    appName: 'Murew',
    paymentSettings: {
        stripePk: '',
        stripe_enabled: false
    },
    activeStore: <Store | null>null,
    stores: <Store[]>[],
    layoutSettings: <LayoutSettings>{},
    storeSettings: <StoreSettings>{},
    pages: <Page[]>[],
    dataLoaded: false,
    preorderSlots: <DateTimeSlot[]>[],
    categories: <Category[]>[],
    cart: <Cart>{
        products: {},
        orderType: 'delivery',
        delivery: -1,
        deliveryDistance: 0,
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
        promo_code: '',
        offerOptions: {
            selectedItems: []
        },
        offerOptionsError: null,
        preorder: {
            enabled: false,
            date: null,
            time: ''
        },
    },
    fetchState: {
        promo_code: false,
    },

    _isMobile: false,
});

declare type State = ReturnType<typeof state>;

export const getters = {
    isDeliveryWithinRange: (state: State) => {
        const { cart, storeSettings } = state;
        if(cart.orderType != 'delivery') return true;
        const { maximum_delivery_distance } = storeSettings;
        if(maximum_delivery_distance == 0) return true; // 0 => UNLIMITED
        const { deliveryDistance } = cart;
        return deliveryDistance < 0 ? false : deliveryDistance <= maximum_delivery_distance;
    },
    canPostOrder: (state: State, getters: any) => {
        return (
            !state.checkout.offerOptionsError
            && Object.values(state.cart.products).reduce((acc, p) => acc + p.qty, 0) > 0
            && getters.productsTotal >= state.storeSettings.minimum_order_value
            && getters.isDeliveryWithinRange
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
    },
    isStoreOpen: (state: State) => {
        const s = state.activeStore;
        if(!s) return false;
        return isStoreOpen(s, new Date());
    }
}

export const actions = {
    async nuxtServerInit({ state }: any, { $strapi, $device }: Context){
        state._isMobile = $device.isMobile;
        try {
            const { prefixUrl } = $strapi.$http._defaults;
            await Promise.all([
                $strapi.find('stores', { active: true }).then(stores => state.stores = stores),
                $strapi.find('public/frontend-settings').then(({ layout, store, payment_settings, pages }: any) => {
                    layout.website_logo = `${prefixUrl}/files/${layout.website_logo}`;
                    state.layoutSettings = layout;
                    state.storeSettings = store;
                    state.paymentSettings = payment_settings;
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

export function isStoreOpen(store: Store, currentTime: Date){
    const s = store;
    const now = currentTime;
    const day = getDayNameFromDate(now).toLowerCase();
    const opening_shifts = (s.opening_hours || {})[day] || [];
    const hour = now.getHours();
    const minute = now.getMinutes();
    for(let shift of opening_shifts){
        const { opens_at, closes_at } = shift;
        const [openHour, openMinute] = opens_at.split(':').map((p: string) => parseInt(p));
        const [closeHour, closeMinute] = closes_at.split(':').map((p: string) => parseInt(p));
        if(
            ( hour > openHour || ( hour == openHour && minute >= openMinute ) ) &&
            ( hour < closeHour || ( hour == closeHour && minute < closeMinute ) )
        ){
            return true;
        }
    }
    return false;
}
