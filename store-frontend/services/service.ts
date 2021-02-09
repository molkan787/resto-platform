import { Context } from '@nuxt/types';
import { State, StoreGetters } from '~/interfaces/State';
export class Service{

    protected readonly state: State;
    protected readonly getters: StoreGetters;
    protected readonly $strapi: any;

    constructor(
        protected readonly context: Context
    ){
        this.state = context.store.state;
        this.getters = context.store.getters;
        this.$strapi = context.$strapi;
    }

}