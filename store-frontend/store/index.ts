import createPersistedState from 'vuex-persistedstate';
import { Category } from '~/interfaces/Category';
import { Product } from '~/interfaces/Product';

export const strict = false;

export const state = () => ({
    dataLoaded: false,
    categories: <Category[]>[],
    cart: {
        products: <any>{},
        orderType: <'delivery' | 'collection'>'delivery',
    },
    products: new Map<string, Product>()
});
