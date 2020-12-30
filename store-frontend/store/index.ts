import createPersistedState from 'vuex-persistedstate';
import { CartProductOptions } from '~/interfaces/CartProductOptions';
import { Category } from '~/interfaces/Category';
import { Product } from '~/interfaces/Product';

export const strict = false;

export const state = () => ({
    dataLoaded: false,
    categories: <Category[]>[],
    cart: {
        products: <CartProducts>{},
        orderType: <'delivery' | 'collection'>'delivery',
    },
    products: new Map<string, Product>()
});

interface CartProducts{
    [productId: string]: CartProductOptions
}