<template>
    <Page>
        <div class="container">
            <h2>Account Settings</h2>
            <div>
                <section>
                    <h4>Profile</h4>
                    <div class="h-form grid c2">
                        <div class="field">
                            <vs-input v-model.trim="user.fullname" placeholder="Fullname" :disabled="loading">
                                <template #icon> <i class="bx bxs-user"></i> </template>
                            </vs-input>
                        </div>
                        <div class="field">
                            <vs-input v-model.trim="user.phone" placeholder="Phone" :disabled="loading">
                                <template #icon> <i class="bx bxs-phone"></i> </template>
                            </vs-input>
                        </div>
                        <div class="field">
                            <vs-input v-model.trim="user.email" placeholder="Email address" :disabled="true">
                                <template #icon> @ </template>
                            </vs-input>
                        </div>
                    </div>
                </section>
                <section>
                    <h4>Default delivery address</h4>
                    <div class="h-form grid c2">
                        <div class="field">
                            <vs-input v-model.trim="address.line1" placeholder="Line 1" :disabled="loading" />
                        </div>
                        <div class="field">
                            <vs-input v-model.trim="address.postcode" placeholder="Post Code" :disabled="loading" />
                        </div>
                        <div class="field">
                            <vs-input v-model.trim="address.line2" placeholder="Line 2" :disabled="loading" />
                        </div>
                        <div class="field">
                            <vs-input v-model.trim="address.city" placeholder="City" :disabled="loading" />
                        </div>
                    </div>
                </section>
                <section>
                    <vs-button @click="saveClick" :loading="loading" block>Save</vs-button>
                </section>
            </div>
        </div>
    </Page>
</template>

<script>
export default {
    data: () => ({
        loading: false,
        user: {},
        address: {}
    }),
    methods: {
        saveClick(){
           if(this.validate()){
               this.save();
           }
        },
        async save(){
            const data = {
                ...this.user,
                default_address: this.address
            };
            this.loading = true;
            try {
                const user = await this.$strapi.update('account/update', data);
                this.$strapi.setUser(user);
                alert('Your information was successfully saved!');
            } catch (error) {
                console.error(error);
                alert('An error occured, Please try again');
            }
            this.loading = false;
        },
        validate(){
            return true;
        }
    },
    mounted(){
        const { default_address, ...user } = this.$strapi.user;
        this.user = Object.assign({}, user);
        this.address = Object.assign({}, default_address);
    }
}
</script>

<style lang="scss" scoped>
.container{
    max-width: 600px;
    padding: 1rem;
}
section{
    width: 100%;
    padding: 2rem 0 0 0;
    h4{
        margin-bottom: 1rem;
    }
}
</style>