<template>
    <div class="data-page-index">
        <section class="card">
            <h2>Menu</h2>
            <label for="import_store">Select store</label> <br>
            <vSelect class="store-select" :options="stores" /> <br>
            <label for="menu_import_file">File containing menu</label> <br>
            <input name="menu_import_file" type="file"/> <br>
            <button>Import</button>
            <hr>
            <button>Export</button>
        </section>
    </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
export default {
    components: {
        vSelect
    },
    data: () => ({
        stores: [],
        importStore: null,
    }),
    mounted(){
        this.stores = strapi.stores || [];
        strapi.onStoresLoaded.push(stores => this.stores = stores);
    }
}
</script>

<style scoped>
.data-page-index{
    padding: 2rem;
}
.store-select{
    width: 300px;
}
h2{
    margin-bottom: 2rem;
}
button, .button{
    display: inline-block;
    position: relative;
    /* top: -1px; */
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
input:not([type="file"]){
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
input:not([type="file"]):focus{
    border-color: #78caff;
}
</style>