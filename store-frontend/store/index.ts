import { Context } from '@nuxt/types';
import { CartProducts } from '~/interfaces/CartProducts';
import { Category } from '~/interfaces/Category';
import { LayoutSettings } from '~/interfaces/LayoutSettings';
import { Product } from '~/interfaces/Product';
import { Store } from '~/interfaces/Store';
import { StoreSettings } from '~/interfaces/StoreSettings';

export const strict = false;

export const state = () => ({
    activeStore: <Store | null>null,
    stores: <Store[]>[],
    layoutSettings: <LayoutSettings>{},
    storeSettings: <StoreSettings>{},
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
        try {
            await Promise.all([
                $strapi.find('stores', { active: true }).then(stores => state.stores = stores),
                $strapi.find('public/frontend-settings').then(({ layout, store }: any) => {
                    state.layoutSettings = layout;
                    state.storeSettings = store;
                })
            ])
        } catch (error) {
            console.error(error)
        }
    }
};