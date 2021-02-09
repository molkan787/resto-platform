import { Context } from "@nuxt/types";
import { Service } from "./service";
import debounce from 'debounce';

export class DeliveryService extends Service {

    constructor(context: Context){
        super(context);
        if(process.client){
            context.store.watch(
                () => this.getDeliveryPostcode(),
                () => this.callUpdateDeliveryOptions(),
                { immediate: true }
            );
            context.store.watch(
                state => state.activeStore,
                () => this.callUpdateDeliveryOptions()
            );
        }
    }

    public getDeliveryPostcode(): string{
        return this.state.checkout.delivery_address.postcode || this.context.$strapi.user?.default_address?.postcode;
    }

    
    private callUpdateDeliveryOptions = debounce(
        () => this.updateDeliveryOption(), 1000
    );

    public async updateDeliveryOption(){
        const deliveryPostcode = this.getDeliveryPostcode();
        const distance = await this.getDeliveryDistance(deliveryPostcode);
        const { free_delivery_maximum_distance, delivery_cost } = this.state.storeSettings;
        if(distance >= 0 && distance < free_delivery_maximum_distance){
            this.state.cart.delivery = 0;
        }else{
            this.state.cart.delivery = delivery_cost;
        }
    }


    public async getDeliveryDistance(deliveryPostcode: string | undefined): Promise<number> {
        let storePostcode = this.state.activeStore?.address.postcode;
        storePostcode = storePostcode?.replace(/\s/g, '').toUpperCase();
        deliveryPostcode = deliveryPostcode?.replace(/\s/g, '').toUpperCase();
        if(!storePostcode || !deliveryPostcode){
            return -1;
        }
        const data = <any>(await this.context.$strapi.find(`geo/postcodes/distance/${storePostcode}/${deliveryPostcode}`));
        return <number>(typeof data?.distance == 'number' ? data.distance : -1);
    }
    
}