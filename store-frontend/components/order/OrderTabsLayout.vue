<template>
    <div class="order-tabs-layout">
        <div class="categories-wrapper">
            <div class="sub-line"></div>
            <div class="categories">
                <VerticalTabTree :items="categories" @selected="categorySelected" />
            </div>
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
            if(!this.selectedCategory) return []
            const childs = this.selectedCategory.children
            if(childs && childs.length > 0){
                const all = [...this.selectedCategory.products]
                for(let n = 0; n < this.selectedCategory.children.length; n++){
                    all.push(...this.selectedCategory.children[n].products)
                }
                return all
            }else{
                return this.selectedCategory.products;
            }
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

    .categories-wrapper{
        display: grid;
        grid-template-columns: 3px auto;
        margin-left: -0.6rem;
        align-self: start;
        .categories {
            width: 250px;
            padding-left: 0.4rem;
        }
        .sub-line{
            height: calc(100% - 40px);
            width: 3px;
            background-color: rgba(80,60,60, 0.5) !important;
            border-radius: 6px;
            margin: 20px 0;
        }
    }
    .products {
        flex: 1;
        min-width: 0;
        padding: 0 1rem 1rem 1rem;
        .content {
            width: 100%;
            display: grid;
            grid-template-columns: 50% 50%;
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
