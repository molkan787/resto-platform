<template>
    <vs-card class="customer-review">
        <template #title>
            <RatingStars :value="data.rating" />
        </template>
        <template #text>
            <p>
                {{ data.comment }}
            </p>
            <span class="user opacity-07">
                <i class="bx bx-user"></i>
                {{ data.customer_name }}
            </span>
        </template>
    </vs-card>
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
            required: true
        }
    }
}
</script>

<style lang="scss" scoped>
.customer-review{
    p{
        margin-bottom: 0.5rem;
    }
}
</style>