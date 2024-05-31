<template>
    <tr class="item">
        <td>
            {{ item.qty }}x
        </td>
        <td>
            {{ item.data.name }} {{  this.extraName  }}
            <AllergyIcon v-if="item.data.contains_allergens" />
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
export default {
    props: {
        item: {
            type: Object,
            required: true,
        },
        options: {
            type: Object,
            required: true,
        }
    },
    methods: {
        adjustQty(amount){
            this.$cartService.adjustProductQuantity(this.item.id, amount);
        }
    },
    computed: {
        useExtrasAsVariations(){
            return this.options.extras.findIndex(e => e.name === 'use_extras_as_variations') >= 0
        },
        extraName(){
            if(this.useExtrasAsVariations){
                return this.options.extras
                    .filter(e => e.name !== 'use_extras_as_variations')
                    .map(e => e.name)
                    .join(' ')
            }
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