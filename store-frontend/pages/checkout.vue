<template>
    <Page class="checkout-page">
        <div class="content">
            <div class="left-col">
                <div class="flexed container">
                    <transition name="defanim">
                        <div v-if="orderType =='delivery'">
                            <vs-card>
                                <template #title>
                                    <h2>Where do you want your order to be delivered?</h2>
                                </template>
                                <template #text>
                                    <div class="address form">
                                        <vs-input :disabled="loading" v-model="addressForm.line1" placeholder="Address line 1"/>
                                        <vs-input :disabled="loading" v-model="addressForm.postcode" placeholder="Post Code"/>
                                        <vs-input :disabled="loading" v-model="addressForm.line2" placeholder="Address line 2"/>
                                        <vs-input :disabled="loading" v-model="addressForm.city" placeholder="City"/>
                                    </div>
                                </template>
                            </vs-card>
                            <div class="sepa" />
                        </div>
                    </transition>
                    <vs-card>
                        <template #title>
                            <h2>Remarks/Note</h2>
                        </template>
                        <template #text>
                            <div class="form">
                                <textarea :disabled="loading" v-model="note" class="note-ta vs-input" placeholder="Remarks/Note"></textarea>
                            </div>
                        </template>
                    </vs-card>
                    <div class="sepa" />
                    <vs-card>
                        <template #title>
                            <h2>Payment method</h2>
                        </template>
                        <template #text>
                            <div class="form">
                                <vs-radio :disabled="loading" v-model="paymentMethod" val="cod">
                                    Cash on Delivery 
                                </vs-radio>
                            </div>
                            <br>
                            <h3>Discount code</h3>
                            <div class="form">
                                <vs-input
                                    v-model="checkout.promo_code" :loading="fetchState.promo_code"
                                    :disabled="loading" placeholder="Discount code"
                                />
                            </div>
                            <div v-if="eligibleOffers.length" class="form offer-selector-wrapper">
                                <OfferSelector />
                            </div>

                            <div v-if="selectedOffer" class="form offer-options-wrapper">
                                <OfferOptions :offer="selectedOffer" :bucket="checkout.offerOptions" :error="checkout.offerOptionsError" />
                            </div>

                            <div v-if="enable_preorders">
                                <PreOrderOptions />
                            </div>

                        </template>
                    </vs-card>
                    <div class="sepa" />
                    <vs-button @click="checkoutClick" :loading="loading" size="xl" block :disabled="!canPostOrder">
                        <b>Checkout</b> &nbsp;
                        <span style="opacity: 0.9">( Total: {{ orderTotal | price }} )</span>
                    </vs-button>
                </div>
            </div>
            <div class="right-col hide-on-mobile">
                <Cart :showOrderButton="false" />
            </div>
        </div>
    </Page>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
export default {
    computed: {
        ...mapGetters(['canPostOrder', 'orderTotal', 'selectedOffer']),
        ...mapState({
            orderType: state => state.cart.orderType,
            checkout: state => state.checkout,
            addressForm: state => state.checkout.delivery_address,
            eligibleOffers: state => state.eligibleOffers,
            fetchState: state => state.fetchState,
            enable_preorders: state => state.storeSettings.enable_preorders
        })
    },
    data: () => ({
        loading: false,
        paymentMethod: 'cod',
        note: '',
    }),
    methods: {
        async checkoutClick(){
            if(this.validateForms()){
                this.loading = true;
                try {
                    const resp = await this.$orderService.postOrder({
                        paymentMethod: this.paymentMethod,
                        note: this.note
                    });
                    this.redirectToOrderPage(resp.order);
                } catch (error) {
                    console.error(error);
                    alert('An error occured, Please make sure you are connected to the internet.');
                }
                this.loading = false;
            }
        },
        validateForms(){
            if(this.orderType == 'delivery'){
                const af = this.addressForm;
                if(af.line1.length < 3 || af.postcode.length < 4 || af.city < 3){
                    alert('Please enter a valid delivery address.');
                    return false;
                }
            }
            const { enabled, date, time } = this.checkout.preorder;
            if(enabled && (!date || !time)){
                alert('Please select preorder data & time');
                return false;
            }
            return true;
        },
        redirectToOrderPage(order){
            this.$router.push(`/account/orders/${order.id}`);
        }
    },
    mounted(){
        const { line1, line2, postcode, city } = (this.$strapi && this.$strapi.user && this.$strapi.user.default_address) || {};
        this.checkout.delivery_address = {
            line1: line1 || '',
            line2: line2 || '',
            postcode: postcode || '',
            city: city || ''
        }
    }
}
</script>

<style lang="scss" scoped>
.checkout-page .content{
    display: flex;
    flex-direction: row;
    max-width: 1300px;
    margin: auto;
    padding-bottom: 12rem;
    .left-col{
        flex: 1;
        padding: 1rem;
    }
    .right-col{
        padding: 1rem;
    }
    .form{
        margin-top: 1rem;
        &.address{
            display: grid;
            grid-template-columns: 300px 200px;
            grid-row-gap: 6px;
            grid-column-gap: 12px;
        }
    }
    .sepa{
        margin: 1rem 0;
    }
    .note-ta{
        resize: none;
        width: 100%;
        height: 10rem;
        border-radius: 16px;
        font-family: inherit;
    }
    .offer-selector-wrapper{
        padding: 1rem 1rem 1rem 0;
        text-align: left;
    }
}
</style>

<style lang="scss">
.checkout-page .content{
    .vs-card{
        max-width: unset !important;
    }
    .form{
        & > div{
            zoom: 1.2;
            width: 100%;
        }
        .vs-input{
            width: 100%;
        }
        .vs-radio-content{
            width: fit-content;
        }
    }
}
</style>