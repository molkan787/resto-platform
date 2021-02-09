import { Context } from "@nuxt/types";
import { State, StoreGetters } from "~/interfaces/State";
import { Service } from "./service";
import { OfferUtils } from 'murew-core';
import debounce from 'debounce';

export class OfferService extends Service {
    
    constructor(context: Context){
        super(context);
        if(process.client){
            context.store.watch(
                (_, getters: StoreGetters) => getters.orderTotal,
                () => this.updateEligibleOffers()
            )
            context.store.watch(
                (state: State) => state.cart.orderType,
                () => this.updateEligibleOffers()
            )
            context.store.watch(
                (state: State) => state.cart.selectedOffer,
                () => this.resetOfferOptions()
            )
            context.store.watch(
                (state: State) => state.checkout.offerOptions,
                () => this.updateOfferOptionsState(),
                { deep: true }
            )
        }
    }

    public updateOfferOptionsState = debounce(() => {
        const offer = this.context.store.getters.selectedOffer;
        const { products, checkout } = this.state;
        if(offer){
            checkout.offerOptionsError = OfferUtils.validateOfferOptions(
                offer,
                checkout.offerOptions,
                products
            )
        }else{
            checkout.offerOptionsError = null;
        }
    }, 10);

    public updateEligibleOffers = debounce(() => {
        const { cart, offers } = this.state;
        const orderTotal = this.context.store.getters.productsTotal;
        const eligibleOffers = OfferUtils.getEligibleOffers(offers, cart, orderTotal);
        this.state.eligibleOffers = eligibleOffers;
        this.resetOfferState();
    }, 10);

    private resetOfferState(): void {
        const { cart, eligibleOffers, checkout } = this.state;
        const { selectedOffer } = cart;
        if(eligibleOffers.findIndex(o => o.id === selectedOffer) == -1){
            cart.selectedOffer = eligibleOffers[0]?.id || null;
        }
        this.resetOfferOptions();
    }

    private resetOfferOptions(){
        this.state.checkout.offerOptions.selectedItems = [];
    }

}