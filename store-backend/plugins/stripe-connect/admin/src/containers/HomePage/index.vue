<template>
    <div class="pos-sync-page-index">
        <section class="card">
            <h2>Stripe Settings</h2>
            <template v-if="initialLoading">
                <span style="font-style:italic">loading...</span>
            </template>
            <template v-else>
                <template v-if="isConnected">
                    <h4>Stripe account connected</h4>
                    <br>
                    <h5>Account Id: <b>{{ state.connected_account_id }}</b></h5>
                    <h5>Account Email: <b>{{ state.connected_account_email }}</b></h5>
                    <br>
                    <button @click="disconnectClick" class="danger button">
                        <i class="fas fa-unlink"></i>
                        Disconnect
                    </button>
                </template>
                <template v-else>
                    <h4>Connect your stripe account to start accepting Debit/Credit Card payment in the website</h4>
                    <br>
                    <ConnectWithStripeButton @click="connectClick" />
                    <span v-if="loading" style="font-style:italic">loading, please wait...</span>
                </template>
                <h4 v-if="status.details_submitted === false" class="error-item">* You need to submit all details on the stripe connect flow</h4>
                <h4 v-if="status.charges_enabled === false" class="error-item">* You need to enable charges in your stripe account</h4>
            </template>
        </section>
    </div>
</template>

<script>
import { request } from 'strapi-helper-plugin';
import ConnectWithStripeButton from '../../elements/ConnectWithStripeButton.vue';
export default {
    components: {
        ConnectWithStripeButton
    },
    data: () => ({
        initialLoading: true,
        loading: false,
        state: {},
        status: {},
    }),
    computed: {
        isConnected(){
            const { connected_account_ready, connected_account_id, connected_account_email } = this.state;
            return connected_account_ready && !!connected_account_id && !!connected_account_email;
        }
    },
    methods: {
        async loadState(){
            const stripeState = await request('/stripe-connect/state', { method: 'GET' });
            this.state = stripeState;
            this.initialLoading = false;
        },
        async disconnectClick(){
            if(!confirm('Remove your stripe account from the platform?')) return;
            this.initialLoading = true;
            try {
                await request('/stripe-connect/disconnect-account', {
                    method: 'POST',
                    body: {}
                });
                await this.loadState();
            } catch (error) {
                console.error(error);
                alert('An error occured');
            }
            this.initialLoading = false;
        },
        async connectClick(){
            if(this.loading) return;
            this.loading = true;
            const thisPageUrl = window.location.href.split('?')[0];
            const returnUrl = `${thisPageUrl}?return=true`;
            const data = await request('/stripe-connect/create-account-link', {
                method: 'POST',
                body: {
                    refresh_url: thisPageUrl,
                    return_url: returnUrl
                }
            });
            window.location.href = data.redirect_url;
        },
        async updateConnectedAccountStatus(){
            const data = await request('/stripe-connect/update-connected-account-status', {
                method: 'POST',
                body: {}
            });
            this.status = data;
            return data.is_ready;
        },
        async bootsrap(){
            if(window.location.search.includes('return=true')){
                await this.updateConnectedAccountStatus();
            }
            await this.loadState();
        }
    },
    mounted(){
        this.bootsrap();
    }
}
</script>

<style scoped>
.items{
    height: calc(100vh - 290px);
    overflow-x: hidden;
    overflow-y: scroll;
}
.my-table{
    width: 100%;
}
.my-table th{
    background-color: rgb(247 247 247);
    border-top: 1px solid #007EFF;
}
.my-table th, .my-table td{
    padding: 0.5rem;
}
.key-data-col{
    max-width: 300px;
}
.key-data-col input{
    background: none;
    border: none;
    width: 100%;
}
.empty-ph{
    padding: 3rem !important;
    text-align: center;
    color: #666;
}
.pos-sync-page-index{
    padding: 2rem !important;
}
h2{
    margin-bottom: 2rem;
}
.store-select, input{
    width: 300px;

}
.button{
    display: inline-block;
    position: relative;
    height: 3.4rem;
    width: fit-content;
    padding: 3px 15px 2px;
    font-weight: 600;
    font-size: 1.3rem;
    line-height: normal;
    border-radius: 2px;
    cursor: pointer;
    outline: 0;
    background-color: #007EFF;
    border: 1px solid #007EFF;
    color: #ffffff;
    transition: opacity 0.2s;
}
.button.gray{
    background-color: #e9e9e9;
    border: 1px solid #e9e9e9;
    color: rgb(71, 71, 71);
}
.button.danger{
    background-color: #F64D0A;
    border: 1px solid #F64D0A;
}
.button:disabled{
    cursor: default;
    opacity: 0.8;
}
.button:active{
    opacity: 0.8;
}
.card{
    display: block !important;
    padding: 2rem;
    background: #ffffff;
    border-radius: 2px;
    box-shadow: 0 2px 4px #e3e9f3;
}
input{
    /* width: 100%; */
    height: 3.4rem;
    padding: 0 1rem;
    font-weight: 400;
    font-size: 1.3rem;
    cursor: text;
    outline: 0;
    border: 1px solid #E3E9F3;
    border-radius: 2px;
    color: #333740;
    background-color: transparent;
}
input:focus{
    border-color: #78caff;
}
.spacer{
    width: 100%;
    min-height: 1px;
}
.spacer.r2{
    height: 2rem;
}
.clear-btn{
    font-size: 20px;
    height: 3.4rem !important;
    float: right;
}
.refreshing{
    color: #777777;
    font-weight: normal;
    font-style: italic;
}
.error-item{
    color: #e2230a;
    font-style: italic;
    font-weight: bold;
    margin-top: 1rem;
}
</style>
