<template>
    <div class="container">
        <div class="content">
            {{ errorText }} <br>
            <nuxt-link to="/">Home</nuxt-link>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        errorText: {
            type: String,
            default: 'An error occured',
        }
    }
}
</script>

<style lang="scss" scoped>
.container{
    height: calc(100vh - 50px);
    display: flex;
    align-items: center;
    justify-content: center;
    .content{
        text-align: center;
    }
}
</style>