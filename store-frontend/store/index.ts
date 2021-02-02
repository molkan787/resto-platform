import { Context } from '@nuxt/types';
import { CartProductOptions } from '~/interfaces/CartProductOptions';
import { CartProducts } from '~/interfaces/CartProducts';
import { Category } from '~/interfaces/Category';
import { LayoutSettings } from '~/interfaces/LayoutSettings';
import { Page } from '~/interfaces/Page';
import { Product } from '~/interfaces/Product';
import { Store } from '~/interfaces/Store';
import { StoreSettings } from '~/interfaces/StoreSettings';

export const strict = false;

export const state = () => ({
    activeStore: <Store | null>null,
    stores: <Store[]>[],
    layoutSettings: <LayoutSettings>{},
    storeSettings: <StoreSettings>{},
    pages: <Page[]>[],
    dataLoaded: false,
    categories: <Category[]>[],
    cart: {
        products: <CartProducts>{},
        orderType: <'delivery' | 'collection'>'delivery',
        delivery: <number>-1,
    },
    products: new Map<string, Product>(),
    checkout: {
        addressForm: {
            line1: '',
            line2: '',
            postcode: '',
            city: '',
        }
    }
});

declare type State = ReturnType<typeof state>;

export const getters = {
    canPostOrder: (state: State, getters: any) => {
        return (
            Object.values(state.cart.products).reduce((acc, p) => acc + p.qty, 0) > 0
            && getters.productsTotal >= state.storeSettings.minimum_order_value
        )
    },
    cartItems: (state: State) => {
        return Object.entries(state.cart.products).map(([id, options]) => {
            const product = state.products.get(id);
            if(!product) return null;
            return {
                id,
                data: product,
                qty: options.qty,
                total: calcItemTotal(product, options)
            }
        }).filter(i => !!i);
    },
    productsTotal: (state: State, getters: any) => {
        return getters.cartItems.reduce((t: number, i: any) => t + i.total, 0);
    },
    orderTotal: (state: State, getters: any) => {
        return getters.productsTotal + (
            state.cart.orderType == 'delivery' ? state.cart.delivery : 0
        )
    }
}

function calcItemTotal(product: Product, options: CartProductOptions){
    const extrasCost = options.extras.reduce((t, e) => t + e.price, 0);
    const unitPrice = product.price + extrasCost;
    return unitPrice * options.qty;
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
        state.cart.orderType = 'collection';
    }else if(!enable_pickup_orders){
        state.cart.orderType = 'delivery';
    }
}