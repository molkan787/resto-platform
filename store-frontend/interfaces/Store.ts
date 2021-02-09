import { Address } from 'murew-core/dist/interfaces';
export interface Store{
    id: string;
    slug: string;
    name: string;
    address: Address;
}