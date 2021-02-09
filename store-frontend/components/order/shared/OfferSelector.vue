<template>
    <div class="offer-selector">
        <h3>Available offers</h3>
        <transition-group name="defanim">
            <div v-for="offer in eligibleOffers" :key="offer.id" class="offer-item">
                <vs-radio v-model="cart.selectedOffer" :val="offer.id">
                    {{ offer | offerText }}
                </vs-radio>
            </div>
        </transition-group>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
    computed: mapState(['cart', 'eligibleOffers']),
    filters: {
        offerText(offer){
            const { name, benefits } = offer;
            const { type, percent_amount } = benefits[0] || {};
            const suffix = type == 'percent_discount' ? ` (-${percent_amount}%)` : '';
            return name + suffix;
        }
    }
}
</script>

<style lang="scss" scoped>
.offer-selector{
    .offer-item{
        width: fit-content;
        margin-top: 0.5rem;
    }
}
</style>