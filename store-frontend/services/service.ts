import { Context } from '@nuxt/types';
import { Strapi } from '~/interfaces/libraries/Strapi';
import { State, StoreGetters } from '~/interfaces/State';
export class Service{

    protected readonly state: State;
    protected readonly getters: StoreGetters;
    protected readonly $strapi: Strapi;

    constructor(
        protected readonly context: Context
    ){
        this.state = context.store.state;
        this.getters = context.store.getters;
        this.$strapi = context.$strapi;
    }

}