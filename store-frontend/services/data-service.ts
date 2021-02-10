import { Service } from "./service";
import { Category } from "~/interfaces/Category";
import { Product, Offer } from 'murew-core/dist/interfaces';

export class DataService extends Service{

    public async getStoreMenu(storeSlug: string){
        if(!this.state.dataLoaded){
            const storeId = this.context.$appService.getStoreIdBySlug(storeSlug);
            if(!storeId) throw new Error('Store Not found');
            const data: any = await this.$strapi.find('public-menus/' + storeId);
            const categories: Category[] = data.categories;
            const offers: Offer[] = data.offers;
            this.state.categories = categories;
            this.state.offers = offers;
            this.state.products = this.createProductsMap(categories);
            this.state.dataLoaded = true;
        }
        return {
            categories: this.state.categories,
            offers: this.state.offers
        };
    }

    private createProductsMap(categories: Category[]): Map<string, Product>{
        const map: Map<string, Product> = new Map();
        for(let category of categories){
            category.products.forEach(p => map.set(p.id, p));
        }
        return map;
    }

}