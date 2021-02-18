<template>
    <div class="floating-cart">
        <Fab @click="open = !open" :icon="icon" :counter="cartCount" />
        <vs-dialog
            v-model="open"
            not-close
            not-padding
        >
            <Cart flat fluid />
        </vs-dialog>
    </div>
</template>

<script>
export default {
    data: () => ({
        open: false
    }),
    computed: {
        icon(){
            return this.open ? 'bx-x' : 'bxs-cart';
        },
        cartCount(){
            return Object.values(this.$store.state.cart.products).length;
        }
    }
}
</script>
