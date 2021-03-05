<template>
    <div class="order-stack-layout">
        <Category v-for="cat in categories" :key="cat.slug" :category="cat" @productClick="productClick" />
    </div>
</template>

<script>
export default {
    props: {
        categories: {
            type: Array,
            required: true
        }
    },
    methods: {
        productClick(product){
            this.$emit('productClick', product);
        }
    }
}
</script>