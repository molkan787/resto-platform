<template>
    <div class="order-tabs-layout">
        <div class="categories">
            <VerticalTabTree :items="categories" @selected="categorySelected" />
        </div>
        <div class="products">
            <div class="content">
                <Product
                    v-for="p in products"
                    :key="p.id"
                    :product="p"
                    @click="$emit('productClick', $event)"
                />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        categories: {
            type: Array,
            required: true,
        },
    },
    computed: {
        products(){
            return this.selectedCategory && this.selectedCategory.products;
        }
    },
    data: () => ({
        selectedCategory: null,
    }),
    methods: {
        categorySelected(category){
            this.selectedCategory = category; 
        }
    }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/_vars";
.order-tabs-layout {
    width: 100%;
    display: flex;
    flex-direction: row;

    .categories {
        width: 250px;
        padding-left: 18px;
        margin-left: -18px;
        border-left: 4px solid rgba(var(--vs-primary), 1);
    }
    .products {
        flex: 1;
        min-width: 0;
        padding: 0 1rem 1rem 1rem;
        .content {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, calc((100% - 1rem) / 2));
            grid-gap: 1rem;
            @media (max-width: $mobile-width) {
                & {
                    grid-template-columns: 100%;
                }
                .product {
                    margin-left: 0;
                    margin-right: 0;
                }
            }
        }
    }
}
</style>
