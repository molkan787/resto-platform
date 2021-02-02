<template>
    <Page>
        <div class="wrapper">
            <div class="content" v-html="content"></div>
        </div>
    </Page>
</template>

<script>
export default {
    async asyncData({ params, $strapi }){
        const data = await $strapi.find('pages', { slug: params.slug });
        return { content: data[0].content };
    }
}
</script>

<style lang="scss" scoped>
.wrapper {
    display: table;
    max-width: 1100px;
    width: 100%;
    margin: auto;
    .content {
        display: table-cell;
        vertical-align: middle;
        padding: 4rem 2rem;
    }
}
</style>