<template>
    <Page v-if="showError">
        <ErrorPageContent errorText="An error occured, Please try to sign in again." />
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
