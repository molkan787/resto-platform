<template>
    <div class="cart">
          <vs-card>
            <template #title>
                <div class="title bb">
                    Cart
                </div>
            </template>
            <template #text>
                <div class="order-type-wrapper bb">
                    <template v-if="orderTypeText">
                        {{ orderTypeText }}
                    </template>
                    <template v-else>
                        <vs-radio v-model="cart.orderType" val="delivery">
                            Delivery 
                        </vs-radio>
                        <vs-radio v-model="cart.orderType" val="collection">
                            Pickup 
                        </vs-radio>
                    </template>
                </div>
                <table class="items-table">
                    <tbody>
                        <template v-for="item in cartItems">
                            <CartItem :item="item" :key="item.id" />
                        </template>
                        <transition name="defanim">
                            <tr v-if="delivery >= 0 && cart.orderType == 'delivery'" class="item">
                                <td></td>
                                <td>{{ delivery > 0 ? 'Delivery' : 'Free delivery' }}</td>
                                <td></td>
                                <td>{{ delivery | price }}</td>
                            </tr>
                        </transition>
                        <tr class="item total">
                            <td></td>
                            <td>Total</td>
                            <td></td>
                            <td>{{ orderTotal | price }}</td>
                        </tr>
                    </tbody>
                </table>
                <label class="min-left">
                    <template v-if="canPostOrder">
                        You've reached the minimum order value!
                    </template>
                    <template v-else>
                        <b>{{ amountLeft | price }}</b> out of {{ minOrderValue | price }} left before placing order
                    </template>
                </label>
                <div v-if="showOrderButton" class="controlls">
                    <vs-button @click="orderClick" size="large" radius="6" :disabled="!canPostOrder">
                        Order
                    </vs-button>
                </div>
            </template>
        </vs-card>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
export default {
    props: {
        showOrderButton: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        ...mapGetters(['canPostOrder', 'cartItems', 'productsTotal', 'orderTotal']),
        ...mapState({
            cartProducts: state => state.cart.products,
            cart: state => state.cart,
            delivery: state => state.cart.delivery,
            storeSettings: state => state.storeSettings,
            minOrderValue: state => state.storeSettings.minimum_order_value
        }),
        amountLeft(){
            return this.minOrderValue - this.productsTotal;
        },
        orderTypeText(){
            const { enable_delivery_orders, enable_pickup_orders } = this.storeSettings;
            if(!enable_delivery_orders || !enable_pickup_orders){
                return enable_delivery_orders ? 'Delivery' : 'Pickup';
            }
        }
    },
    methods: {
        async orderClick(){
            this.$router.push({
                path: '/checkout'
            });
        }
    }
}
</script>

<style lang="scss" scoped>
$pad: 1rem;
.cart{
    position: sticky;
    top: 18px;
    z-index: 1;
    .bb{
        border-bottom: 1px solid rgb(201, 201, 201);
    }
    .title{
        // min-width: 400px;
        font-size: 18px;
        color: #222;
        padding: $pad;
        text-align: center;
    }
    .items-table{
        padding: $pad;
        .item{
            &.total{
                td{
                    font-weight: bold;
                }
            }
            td{
                padding: 0.5rem;
                &.price-cell{
                    text-align: right;
                }
            }
        }
        &, .items-table{
            width: 100%;
        }
    }
    .controlls{
        padding: 0;
        // transform: translateY(50%);
        button{
            width: 100%;
            text-align: center;
            display: inline;
            margin: 0;
            margin-top: 2rem;
            box-sizing: border-box;
        }
    }
    .min-left{
        display: block;
        text-align: center;
    }
    .order-type-wrapper{
        display: flex;
        justify-content: space-evenly;
        padding: 5px 15px 9px 15px;
        font-size: 15px;
    }
}
</style>

<style lang="scss">
.cart{
    .vs-card__text, .vs-card__title{
        min-width: 314px;
    }
    .vs-radio-content{
        display:inline-flex !important;
        user-select: none;
    }
}
</style>