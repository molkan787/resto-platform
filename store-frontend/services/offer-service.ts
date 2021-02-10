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
                () => this._updateEligibleOffers()
            )
            context.store.watch(
                (state: State) => state.cart.orderType,
                () => this._updateEligibleOffers()
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
            context.store.watch(
                (state: State) => state.checkout.promo_code,
                () => this._updatePromoCodeOffer(),
            )
        }
    }

    private _updatePromoCodeOffer = debounce(() => this.updatePromoCodeOffer(), 250);
    public async updatePromoCodeOffer(){
        const { fetchState, checkout, offers, cart } = this.state;
        fetchState.promo_code = true;
        try {
            const [ offer ] = await this.$strapi.find('offers', {
                activated_by_promo_code: true,
                promo_code: checkout.promo_code.toUpperCase()
            });
            if(offer && offers.findIndex(o => o.id == offer.id) == -1){
                offers.unshift(offer);
                this.updateEligibleOffers();
                if(this.state.eligibleOffers.includes(offer)){
                    cart.selectedOffer = offer.id
                }
            }
        } catch (error) {
            
        }
        fetchState.promo_code = false;
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

    public _updateEligibleOffers = debounce(() => this.updateEligibleOffers(), 10);
    public updateEligibleOffers(){
        const { cart, offers } = this.state;
        const orderTotal = this.context.store.getters.productsTotal;
        const eligibleOffers = OfferUtils.getEligibleOffers(offers, cart, orderTotal);
        this.state.eligibleOffers = eligibleOffers;
        this.resetOfferState();
    }

    private resetOfferState(): void {
        const { cart, eligibleOffers } = this.state;
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