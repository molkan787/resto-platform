import { Service } from "./service";
import { Category } from "~/interfaces/Category";
import { Product } from "~/interfaces/Product";

export class DataService extends Service{

    public async getCategories(){
        if(!this.state.dataLoaded){
            const categories: Category[] = await this.$strapi.find('categories');
            this.state.categories = categories;
            this.state.products = this.createProductsMap(categories);
        }
        return this.state.categories;
    }

    private createProductsMap(categories: Category[]): Map<number, Product>{
        const map: Map<number, Product> = new Map();
        for(let category of categories){
            category.products.forEach(p => map.set(p.id, p));
        }
        return map;
    }

}