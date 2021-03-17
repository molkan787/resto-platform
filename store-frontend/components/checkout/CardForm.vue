<template>
    <div class="card-form">
        <div ref="card-element"></div>
        <div class="card-error" v-if="state.error">
            {{ state.error }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        state: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        card: null,
    }),
    async mounted(){
        const stripe = await this.$paymentService.getStripe();
        const card = this.card = stripe.elements().create('card');
        card.mount(this.$refs['card-element']);
        this.state.card = card;
        this.state.ready = false;
        this.state.error = null;
        card.on('change', ({ error, complete }) => {
            this.state.error = error ? error.message : null;
            this.state.ready = !!complete;
        });
    },
    beforeDestroy(){
        this.card && this.card.destroy();
    }
}
</script>

<style lang="scss" scoped>
.card-form{
    .card-error{
        color: rgba(var(--vs-danger), 1);
        padding-top: 0.5rem;
    }
}
</style>