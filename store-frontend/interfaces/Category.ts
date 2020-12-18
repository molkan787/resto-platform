import { Product } from "./Product";

export interface Category{
    name: string;
    slug: string;
    products: Product[];
}