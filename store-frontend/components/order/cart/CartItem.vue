<template>
    <tr class="item">
        <td>
            {{ item.qty }}x
        </td>
        <td>
            {{ item.data.name }}
        </td>
        <td class="cart-items-buttons">
            <vs-button circle size="small" @click="adjustQty(-1)" class="p-button p-button-sm">
                <i class='bx bx-minus'></i>
            </vs-button>
            <vs-button circle size="small" @click="adjustQty(1)" class="p-button p-button-sm">
                <i class='bx bx-plus'></i>
            </vs-button>
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

<style lang="scss">
.item .cart-items-buttons{
    white-space: nowrap;
    button{
        display: inline;
    }
}
</style>