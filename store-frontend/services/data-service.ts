import { Service } from "./service";
import { Category } from "~/interfaces/Category";
import { Product } from "~/interfaces/Product";

export class DataService extends Service{

    public async getCategories(storeSlug: string){
        if(!this.state.dataLoaded){
            const storeId = this.context.$appService.getStoreIdBySlug(storeSlug);
            if(!storeId) throw new Error('Not found');
            const categories: Category[] = await this.$strapi.find('public-menus/' + storeId);
            this.state.categories = categories;
            this.state.products = this.createProductsMap(categories);
            this.state.dataLoaded = true;
        }
        return this.state.categories;
    }

    private createProductsMap(categories: Category[]): Map<string, Product>{
        const map: Map<string, Product> = new Map();
        for(let category of categories){
            category.products.forEach(p => map.set(p.id, p));
        }
        return map;
    }

}