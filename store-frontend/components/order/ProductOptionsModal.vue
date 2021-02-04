<template>
    <vs-dialog v-model="isOpen" ref="dialog" width='400px' :auto-width="false">
        <template #header>
            <h3>{{ product.name }}</h3>
        </template>
        <ProductOptions ref="optionsForm" :product="product" />
        <vs-alert v-if="product.contains_allergens" color="warn">Warning: This product contains allergens (ex: Peanuts, Wheat...)</vs-alert>
        <template #footer>
            <vs-button @click="addToCartClick" flat size="large" block>
                {{ editMode ? 'Update' : 'Add to Cart' }}
            </vs-button>
        </template>
    </vs-dialog>
</template>

<script>
export default {
    data: () => ({
        isOpen: false,
        product: {},
        editMode: false,
    }),
    methods: {
        open(product){
            this.product = product;
            this.isOpen = true;
            this.$nextTick(() => this.loadOptions());
        },
        loadOptions(){
            const options = this.$cartService.getItemOptions(this.product.id);
            this.editMode = !!options;
            this.$refs.optionsForm.setOptions(options);
        },
        addToCartClick(){
            const options = this.$refs.optionsForm.$data;
            this.$cartService.setProduct(this.product.id, options);
            this.isOpen = false;
        }
    }
}
</script>