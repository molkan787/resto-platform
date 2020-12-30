import { Context } from '@nuxt/types';
import { CartProducts } from '~/interfaces/CartProducts';
import { Category } from '~/interfaces/Category';
import { Product } from '~/interfaces/Product';
import { Store } from '~/interfaces/Store';

export const strict = false;

export const state = () => ({
    activeStore: <Store | null>null,
    stores: <Store[]>[],
    dataLoaded: false,
    categories: <Category[]>[],
    cart: {
        products: <CartProducts>{},
        orderType: <'delivery' | 'collection'>'delivery',
    },
    products: new Map<string, Product>()
});

export const actions = {
    async nuxtServerInit({ state }: any, { $strapi }: Context){
        const stores = await $strapi.find('stores', { active: true });
        state.stores = stores;
    }
};