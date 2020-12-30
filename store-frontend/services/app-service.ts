import { Store } from "~/interfaces/Store";
import { Service } from "./service";

const SID_KEY = 'm_sid_key';

export class AppService extends Service{

    public setActiveStoreBySlug(slug: string){
        const store = this.getStoreBySlug(slug);
        this.setActiveStore(store);
    }

    public setActiveStore(store: Store | null){
        const newSid = store && store.id;
        const sid = window.localStorage.getItem(SID_KEY);
        window.localStorage.setItem(SID_KEY, newSid || '');
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