<template>
    <!-- <iframe class="frame" :src="url" frameborder="0"></iframe> -->
    <object class="frame"  :data="url" type="application/pdf">
        <embed :src="url" type="application/pdf" />
    </object>
</template>

<script>
export default {
    head(){
        return {
            title: this.title
        }
    },
    asyncData({ query, $strapi }){
        const { prefixUrl } = $strapi.$http._defaults;
        return {
            url: `${prefixUrl}${decodeURIComponent(query.u)}`,
            title: query.title
        }
    }
}
</script>

<style lang="scss" scoped>
.frame{
    width: 100%;
    height: 100vh;
}
</style>

<style lang="scss">
html, body{
    overflow-y: hidden;
}
</style>