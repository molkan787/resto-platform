import { Address } from "./Address";

export interface Store{
    id: string;
    slug: string;
    name: string;
    address: Address;
}