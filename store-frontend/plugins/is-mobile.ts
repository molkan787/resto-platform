import { Context, Plugin } from '@nuxt/types';
import isMobile from '~/libs/isMobile';
import Vue from 'vue';

declare module '@nuxt/types'{
    interface Context{
        $isMobile: isMobile;
    }
}

declare module 'vue/types/vue'{
    interface Vue{
        isMobile: boolean;
    }
}

const isMobilePlugin: Plugin = (context: Context) => {
    if(process.client){
        context.$isMobile = new isMobile(state => context.store.state._isMobile = state);
    }
    Vue.mixin({
        computed: {
            isMobile(){
                // @ts-ignore
                return this.$store.state._isMobile;
            }
        }
    });
}

export default isMobilePlugin;