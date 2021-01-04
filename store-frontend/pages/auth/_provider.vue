<template>
    <Page v-if="showError">
        <div class="container">
            <div class="content">
                An error occured, Please to sign in again. <br>
                <nuxt-link to="/">Home</nuxt-link>
            </div>
        </div>
    </Page>
    <div v-else>
        Please wait...
    </div>
</template>

<script>
export default {
    asyncData({ params, query }){
        return {
            provider: params.provider,
            query
        };
    },
    data: () => ({
        showError: false,
    }),
    async mounted(){
        try {
            const { jwt, user } = await this.$strapi.find(`auth/${this.provider}/callback`, this.query);
            await this.$strapi.setToken(jwt);
            await this.$strapi.setUser(user);
            this.$router.push(window.localStorage.getItem('redirect') || '/');
        } catch (error) {
            console.error(error);
            this.showError = true;
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