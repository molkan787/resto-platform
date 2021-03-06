<template>
    <Page class="reviews-page" title="Reviews">
        <div class="page-container thin">
            <h2 class="header p-color text-center">Our customers reviews</h2>
            <div class="reviews">
                <CustomerReview v-for="review in reviews" :key="review.id" :data="review" />
                <div class="no-reviews-placeholder" v-if="reviews.length == 0">
                    There is no review yet
                </div>
            </div>
        </div>
    </Page>
</template>

<script>
export default {
    async asyncData({ $strapi }){
        const reviews = await $strapi.find('reviews', { _sort: 'published_at:DESC', _limit: 20 });
        return { reviews }
    },
    data: () => ({
        reviews: []
    })
}
</script>

<style lang="scss" scoped>
.reviews-page{
    .header{
        margin-top: 5vh;
        margin-bottom: 5vh;
    }
    .reviews{
        padding-top: 2rem;
        div{
            margin-bottom: 0.5rem;
        }
        .no-reviews-placeholder{
            padding: 2em;
            text-align: center;
            opacity: 0.7;
            font-style: italic;
        }
    }
}
</style>