<template>
    <Page class="write-review-page" title="Write a review">
        <ErrorPageContent v-if="!orderNo" errorText="An error occured, Please make sure you've typed the correct URL." />
        <div v-else class="page-container thin text-center">
            <h2 class="p-color">Write a review about your order</h2>
            <h4 class="order-no">Order No: {{ orderNo }}</h4>
            <div class="spacer s2"></div>
            <div v-if="done" class="done-text">
                Thank you for your review!
            </div>
            <vs-card v-else class="card">
                <template #text>
                    <h4>&nbsp;</h4>
                    <h2 class="rate-field">
                        Rate <RatingStars v-model="rating" mutable />
                        <template v-if="rating > 0">({{ rating }}/5)</template>
                    </h2>
                    <textarea v-model="comment" class="vs-textarea vs-input" placeholder="Optionaly add a comment"></textarea>
                </template>
                <template #buttons>
                    <vs-button :loading="loading" @click="postClick" block size="large">Post</vs-button>
                </template>
            </vs-card>
        </div>
    </Page>
</template>

<script>
export default {
    asyncData({ query }){
        return { orderNo: query.order }
    },
    data: () => ({
        loading: false,
        done: false,
        rating: 0,
        comment: ''
    }),
    methods: {
        postClick(){
            if(this.validateForm()){
                this.postReview();
            }
        },
        async postReview(){
            this.loading = true;
            try {
                await this.$strapi.create('reviews/post', {
                    order_no: this.orderNo,
                    rating: this.rating,
                    comment: this.comment
                });
                this.done = true;
            } catch (error) {
                console.error(error);
                alert('An error occured, ' + error.message);
            }
            this.loading = false;
        },
        validateForm(){
            if(this.rating == 0){
                alert('Please rate the order');
            }else{
                return true;
            }
            return false;
        }
    }
}
</script>

<style lang="scss" scoped>
.write-review-page{
    .order-no{
        margin-top: 0.5rem;
        opacity: 0.8;
    }
    .card{
        text-align: left;
    }
    .rate-field{
        margin-bottom: 1rem;
    }
    .done-text{
        padding: 2rem 0;
        font-size: 2rem;
        opacity: 0.8;
    }
}
</style>