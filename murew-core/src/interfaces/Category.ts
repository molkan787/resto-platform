import { Product } from "./Product";

export interface Category{
    name: string;
    slug: string;
    parent?: Category;
    menu: 'pos' | 'online';
    type: CategoryContentType;
    products: Product[];
    children: Category[];
    remote_id: number;
    store_id?: string;
}

export enum CategoryContentType{
    Food = 'food',
    Drinks = 'drinks'
}