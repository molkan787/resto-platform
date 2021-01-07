<template>
    <div class="pos-sync-page-index">
        <section class="card">
            <h2>POS Sync</h2>
            <p>
                Synchronize your pos menu with the online ordering system. <br>
                To get started select store and click generate sync key.
            </p>

            <label for="import_store"><b>Select store</b></label> <br>
            <vSelect v-model="selectedStore" class="store-select" :options="stores" /> <br>
            <label for="import_store"><b>Name</b></label> <br>
            <input v-model.trim="keyName" /> <br>

            <div class="spacer r2"></div>

            <template v-if="loading">
                <div class="button" disabled>
                    <i class="fas fa-cog fa-spin"></i>
                    Generating...
                </div>
            </template>
            <template v-else>
                <button @click="generateClick">
                    Generate Sync Key
                </button>
            </template>
            <div class="spacer r2"></div>
            <hr>
            <div class="spacer r2"></div>
            <h3>Existing Sync Keys</h3>
            <table class="my-table">
                <thead>
                    <tr>
                        <th>Store</th>
                        <th>Name</th>
                        <th>Creation date</th>
                        <th>Key</th>
                        <th> </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="keys.length < 1">
                        <td class="empty-ph" colspan="5">No existing keys</td>
                    </tr>
                    <tr v-for="k in keys" :key="k.id">
                        <td>{{ k.store.name }}</td>
                        <td>{{ k.name }}</td>
                        <td>{{ new Date(k.createdAt).toLocaleString() }}</td>
                        <td class="key-data-col">
                            <input readonly :id="'key-data-' + k.id" type="text" :value="k.key_data">
                        </td>
                        <td>
                            <button @click="copyClick(k)">
                                <i class="fas fa-copy"></i>
                                Copy Key
                            </button>
                            <button @click="deleteClick(k)" class="danger">
                                <i class="fas fa-trash"></i>
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import { request } from 'strapi-helper-plugin';
export default {
    components: {
        vSelect
    },
    data: () => ({
        stores: [],
        selectedStore: null,
        keyName: '',
        loading: false,
        keys: []
    }),
    methods: {
        generateClick(){
            if(!this.selectedStore){
                strapi.notification.error('Please select a store');
            }else if(this.keyName.length < 1){
                strapi.notification.error('Please type a name for the key');
            }else{
                this.generate();
            }
        },
        async generate(){
            this.loading = true;
            try {
                const key = await request('/pos-sync/generate-key', {
                    method: 'POST',
                    body: {
                        store_id: this.selectedStore.value,
                        name: this.keyName
                    }
                });
                this.keys.unshift(key);
                strapi.notification.success('Key successfully generated!');
                console.log(key);
            } catch (error) {
                console.error(error);
                strapi.notification.error(error.toString());
            }
            this.loading = false;
        },
        copyClick(key){
            const td = document.getElementById('key-data-' + key.id);
            td.select();
            td.setSelectionRange(0, 99999);
            document.execCommand("copy");
            strapi.notification.info('Key copied to your clipboard');
        },
        deleteClick(key){
            if(confirm('Delete key?\nDeleting a sync key will prevent POS Application that uses that key from syncing the menu.')){
                this.deleteKey(key);
            }
        },
        async deleteKey(key){
            try {
                await request('/pos-sync/key/' + key.id, {
                    method: 'DELETE'
                });
                const index = this.keys.indexOf(key);
                index >= 0 && this.keys.splice(index, 1);
                strapi.notification.success('Key successfully deleted!');
            } catch (error) {
                console.error(error);
                strapi.notification.error(error.toString());
            }
        }
    },
    mounted(){
        this.stores = strapi.stores || [];
        strapi.onStoresLoaded.push(stores => this.stores = stores);
        request('/pos-sync/all-keys', { method: 'GET' })
        .then(keys => this.keys = keys);
    }
}
</script>

<style scoped>
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
button, .button{
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
}
button.danger, .button.danger{
    background-color: #F64D0A;
    border: 1px solid #F64D0A;
}
button:disabled{
    cursor: default;
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
</style>

<style>
.vs__dropdown-toggle{
    border-radius: 0 !important;
}
.vs__dropdown-toggle > ul{
    border-radius: 0 !important;
}
</style>