import { Category } from '~/interfaces/Category';

export const strict = false;

export const state = () => ({
    dataLoaded: false,
    categories: <Category[]>[],
    cart: {
        products: <any>{}
    },
    products: new Map()
})