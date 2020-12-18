<template>
    <tr class="item">
        <td>
            {{ item.qty }}x
        </td>
        <td>
            {{ item.data.name }}
        </td>
        <td>
            <button @click="adjustQty(-1)" class="p-button p-button-sm">-</button>
            <button @click="adjustQty(1)" class="p-button p-button-sm">+</button>
        </td>
        <td class="price-cell">
            {{ item.total | price }}
        </td>
    </tr>
</template>

<script>
import { CartService } from '@/services/cart-service';
export default {
    props: {
        item: {
            type: Object,
            required: true,
        }
    },
    methods: {
        adjustQty(amount){
            this.$cartService.adjustProductQuantity(this.item.id, amount);
        }
    }
}
</script>

<style lang="scss" scoped>
.item td{
    padding: 0.5rem;
    &.price-cell{
        text-align: right;
    }
}
</style>