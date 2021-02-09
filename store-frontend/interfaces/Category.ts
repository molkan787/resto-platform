import { Product } from "murew-core/dist/interfaces";

export interface Category{
    name: string;
    slug: string;
    products: Product[];
}