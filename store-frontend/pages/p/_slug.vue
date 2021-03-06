<template>
    <Page :title="name">
        <div class="wrapper">
            <div class="content dynamic-page-content" v-html="content"></div>
        </div>
    </Page>
</template>

<script>
export default {
    async asyncData({ params, $strapi }){
        const data = await $strapi.find('pages', { slug: params.slug });
        const { name, content } = data[0];
        return { name, content };
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

<style lang="scss">
.dynamic-page-content{
    h1, h2{
        color: rgba(var(--vs-primary), 1);
    }
}
</style>