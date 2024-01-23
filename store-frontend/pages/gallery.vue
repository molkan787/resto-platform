<template>
    <Page class="gallery-page" title="Gallery">
        <div class="page-container">
            <h1>Our Gallery</h1>
            <div class="images-grid">
                <div v-for="(image, i) in images" :key="i" @click="currentIndex = i"
                    class="item" :style="`background-image: url(${image.thumbnail})`"
                ></div>
            </div>
            <client-only>
                <GallerySlideshow
                    :index="currentIndex"
                    :images="images"
                    @close="currentIndex = null"
                />
            </client-only>
        </div>
    </Page>
</template>

<script>
export default {
    async asyncData({ $strapi }){
        const { prefixUrl } = $strapi.$http._defaults;
        const data = await $strapi.find('gallery');
        const images = data.images.map(({ alternativeText, url, formats }) => ({
            alt: alternativeText,
            url: prefixUrl + url,
            thumbnail: `${prefixUrl}/files/${formats.thumbnail.name}`,
        }));
        return { images }
    },
    data: () => ({
        currentIndex: null,

    })
}
</script>

<style lang="scss" scoped>
h1{
    margin: 1rem 0 2rem 0.5rem;
}
.images-grid {
    display: flex;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    .item{
        $w: 150px;
        width: $w;
        height: $w;
        background-color: rgb(180, 180, 180);
        border-radius: 4px;
        overflow: hidden;
        margin: 0.5rem;
        cursor: pointer;
        display: table;
        background-size: cover;
        transition: all 0.2s;
        &:hover{
            transform: scale(1.03);
        }
        @media (max-width: 768px){
            width: calc((100% - 2.3rem) / 2);
        }
    }
}
</style>