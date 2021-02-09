export interface Product{
    id: string;
    name: string;
    price: number;
    description?: string;
    category?: string;
    remote_id: number;
    enable_stock: boolean;
    stock: number;
    contains_allergens: boolean;
    extras: any[];
    store_id?: string;
}