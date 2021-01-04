<template>
    <div class="categories-header hide-scrollbar">
        <div class="items">
            <div v-for="cat in items" :key="'tab-sel-' + cat.slug" flat square
                @click="categoryNameClicked(cat)">
                {{ cat.name }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        items: {
            type: Array,
            required: true,
        }
    },
    methods: {
        categoryNameClicked(category){
            const selector = `category-pane-${category.slug}`;
            document.getElementById(selector).scrollIntoView({ behavior: 'smooth' });
        },
    }
}
</script>

<style lang="scss" scoped>
.categories-header{
    width: 100%;
    height: fit-content;
    overflow-x: scroll;
    overflow-y: hidden;
    position: sticky;
    background-color: white;
    padding: 6px;

    .items {
        display: flex;
        flex-direction: row;
        white-space: nowrap;
        & > div{
            // background: #f003;
            padding: 12px 12px;
            cursor: pointer;
        }
    }
}
</style>