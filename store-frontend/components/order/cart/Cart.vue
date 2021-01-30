<template>
    <div class="cart">
          <vs-card>
            <template #title>
                <div class="title">
                    Cart
                </div>
            </template>
            <template #text>
                <table class="items-table">
                    <tbody>
                        <template v-for="item in items">
                            <CartItem :item="item" :key="item.id" />
                        </template>
                        <tr class="item total">
                            <td></td>
                            <td>Total</td>
                            <td></td>
                            <td>{{ total | price }}</td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="showOrderButton" class="controlls">
                    <vs-button @click="orderClick" size="large" radius="6">
                        Order
                    </vs-button>
                </div>
            </template>
        </vs-card>
        <div class="order-type-wrapper">
            <vs-button-group>
                <vs-button block flat @click="cart.orderType = 'delivery'" :active="cart.orderType == 'delivery'">
                    Delivery
                </vs-button>
                <vs-button block flat @click="cart.orderType = 'collection'" :active="cart.orderType == 'collection'">
                    Pickup
                </vs-button>
            </vs-button-group>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
    props: {
        showOrderButton: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        ...mapState({
            cartProducts: state => state.cart.products,
            cart: state => state.cart,
        }),
        items(){
            return Object.entries(this.cartProducts).map(([id, options]) => {
                const product = this.$store.state.products.get(id);
                if(!product) return null;
                return {
                    id,
                    data: product,
                    qty: options.qty,
                    total: this.calcItemTotal(product, options)
                }
            }).filter(i => !!i);
        },
        total(){
            return this.items.reduce((total, item) => total + item.total, 0);
        }
    },
    methods: {
        calcItemTotal(product, options){
            const extrasCost = options.extras.reduce((t, e) => t + e.price, 0);
            const unitPrice = product.price + extrasCost;
            return unitPrice * options.qty;
        },
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
    .title{
        // min-width: 400px;
        font-size: 18px;
        color: #222;
        border-bottom: 1px solid rgb(201, 201, 201);
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
    .order-type-wrapper{
        padding: 15px;
    }
}
</style>

<style lang="scss">
.cart{
    .vs-card__text, .vs-card__title{
        min-width: 314px;
    }
}
</style>