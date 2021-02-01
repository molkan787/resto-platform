import { Context } from "@nuxt/types";
import { Store } from "~/interfaces/Store";
import { bootstrap } from "~/store";
import { ACTIVE_STORE_LS_KEY } from "./constants";
import { Service } from "./service";

export class AppService extends Service{

    constructor(context: Context){
        super(context);
        if(process.client){
            const storeId = window.localStorage.getItem('m_sid_key');
            const storeIndex = this.state.stores.findIndex(s => s.id === storeId);
            const store = this.state.stores[storeIndex];
            this.state.activeStore = store;
            try {
                window.addEventListener('load', () => {
                    context.$dataService.getCategories(store.slug)
                    .then(() => {
                        context.$cartService.loadCart();
                        bootstrap(this.state);
                        context.$cartService.saveCart();
                    });
                })
            } catch (error) {
                console.log(error);
            }
        }
        if(process.env.NODE_ENV == 'development' && process.client){
            // @ts-ignore
            window.state = this.state;
        }
    }

    public setActiveStoreBySlug(slug: string){
        const store = this.getStoreBySlug(slug);
        this.setActiveStore(store);
    }

    public setActiveStore(store: Store | null){
        const newSid = store && store.id;
        const sid = window.localStorage.getItem(ACTIVE_STORE_LS_KEY);
        window.localStorage.setItem(ACTIVE_STORE_LS_KEY, newSid || '');
        this.state.activeStore = store;
        if(newSid != sid){
            this.context.$cartService.clearCart();
        }
    }

    public getActiveStoreId(): string | null{
        const store = this.state.activeStore;
        return store ? store.id : null;
    }

    public getStoreIdBySlug(slug: string): string | null{
        const store = this.getStoreBySlug(slug);
        return store ? store.id : null;
    }

    public getStoreBySlug(slug: string): Store | null{
        return this.state.stores.find(s => s.slug == slug) || null;
    }

}