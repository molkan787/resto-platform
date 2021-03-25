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
                                <textarea :disabled="loading" v-model="note" class="vs-textarea vs-input" placeholder="Remarks/Note"></textarea>
                            </div>
                        </template>
                    </vs-card>
                    <div class="sepa" />
                    <vs-card>
                        <template #title>
                            <h2>Payment method</h2>
                        </template>
                        <template #text>
                            <div class="form payment-methods">
                                <div>
                                    <vs-radio :disabled="loading" v-model="paymentMethod" val="cod">
                                        {{ orderType == 'delivery' ? 'Pay on Delivery' : 'Pay on Pickup' }}
                                    </vs-radio>
                                </div>
                                <div v-if="stripe_enabled">
                                    <vs-radio :disabled="loading" v-model="paymentMethod" val="online_card">
                                        Credit/Debit Card
                                    </vs-radio>
                                </div>
                                <div></div>
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
                    <vs-card v-if="paymentMethod == 'online_card'">
                        <template #title>
                            <h2>Payment details</h2>
                        </template>
                        <template #text>
                            <div class="sepa" />
                            <label>Card information</label>
                            <div class="sepa" />
                            <CardForm :state="cardFormState" />
                            <div class="sepa" />
                        </template>
                    </vs-card>
                    <vs-alert v-if="!user" color="warn">
                        You must <a @click="loginClick" href="#">login</a> or <a @click="registerClick" href="#">register</a> before placing an Order
                    </vs-alert>
                    <vs-button @click="checkoutClick" :loading="loading" size="xl" block :disabled="!mycanPostOrder">
                        <b>{{ paymentMethod == 'online_card' ? 'Pay & Submit order' : 'Checkout' }}</b> &nbsp;
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
            enable_preorders: state => state.storeSettings.enable_preorders,
            stripe_enabled: state => state.paymentSettings.stripe_enabled
        }),
        user(){
            return this.$strapi.user;
        },
        mycanPostOrder(){
            return this.user && this.canPostOrder && (this.paymentMethod !== 'online_card' || this.cardFormState.ready);
        }
    },
    data: () => ({
        loading: false,
        note: '',
        paymentMethod: 'cod',
        cardFormState: {
            card: null,
            ready: false,
            error: null
        }
    }),
    methods: {
        async checkoutClick(){
            if(this.validateForms()){
                this.loading = true;
                try {
                    const paymentMethod = this.paymentMethod;
                    const resp = await this.$orderService.postOrder({
                        paymentMethod: paymentMethod,
                        note: this.note
                    });
                    let paymentSuccess = false;
                    if(paymentMethod == 'online_card'){
                        paymentSuccess = await this.submitPayment(resp.payment_intent);
                        paymentSuccess = await this.$orderService.confirmOrderPayment(resp.order.id);
                    }else{
                        paymentSuccess = true;
                    }
                    if(paymentSuccess){
                        this.$cartService.clearCart();
                        this.redirectToOrderPage(resp.order);
                    }
                } catch (error) {
                    console.error(error);
                    alert('An error occured, Please make sure you are connected to the internet.');
                }
                this.loading = false;
            }
        },
        async submitPayment(paymentIntent){
            const { client_secret } = paymentIntent;
            if(!client_secret) throw 'Missing client_secret in PaymentIntent';
            const stripe = await this.$paymentService.getStripe();
            const result = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: this.cardFormState.card,
                    billing_details: {
                        name: this.$strapi.user.fullname
                    }
                }
            });
            if(result.error){
                alert(result.error.message, 'Payment failed');
            }else if(result.paymentIntent.status === 'succeeded'){
                return true;
            }
            return false;
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
        },
        registerClick(e){
            e.preventDefault();
            openAuthModal('register');
        },
        loginClick(e){
            e.preventDefault();
            openAuthModal('login');
        },
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
            grid-template-columns: 58% 38%;
            grid-row-gap: 6px;
            grid-column-gap: 12px;
        }
    }
    .sepa{
        margin: 1rem 0;
    }

    .offer-selector-wrapper{
        padding: 1rem 1rem 1rem 0;
        text-align: left;
    }
    .payment-methods{
        display: flex;
        flex-direction: row;
        @media only screen and (max-width: 786px) {
            flex-direction: column;
            & > div{
                margin-bottom: 0.5rem;
            }
        }
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