import { state as _state } from '@/store';
import { Context } from '@nuxt/types';
export class Service{

    protected readonly state: ReturnType<typeof _state>;
    protected readonly $strapi: any;

    constructor(
        protected readonly context: Context
    ){
        this.state = context.store.state;
        this.$strapi = context.$strapi;
    }

}