<template>
    <div class="reports-page-index">
        <section class="card">
            <h2>Reports</h2>
            <label for="datefrom">From</label>
            <input :disabled="loading" v-model="datefrom" name="datefrom" type="date"/>
            <label for="dateto">To</label>
            <input :disabled="loading" v-model="dateto" name="dateto" type="date"/>
            <template v-if="loading">
                <div class="button" disabled>
                    <i class="fas fa-cog fa-spin"></i>
                    Generating...
                </div>
            </template>
            <template v-else>
                <button @click="generateClick">
                    Generate reports
                </button>
            </template>
        </section>
    </div>
</template>

<script>
import request from '../../request';
import download from 'downloadjs';
export default {
    data: () => ({
        loading: false,
        datefrom: '2021-01-01',
        dateto: '2021-01-03',
    }),
    methods: {
        async generateClick(){
            if(this.validate()){
                this.loading = true;
                try {
                    await this.generateAndDownload(this.datefrom, this.dateto);
                    strapi.notification.success('Reports generated');
                } catch (error) {
                    console.error(error);
                    strapi.notification.error('An error occured, Please make sure you have internet connection');
                }
                this.loading = false;
            }
        },
        validate(){
            if(!this.datefrom || !this.dateto){
                strapi.notification.error('Please select date range');
            }else{
                return true;
            }
            return false;
        },
        async generateAndDownload(dateFrom, dateTo){
            const response = await request('/reports/generate', {
                method: 'GET',
                params: { dateFrom, dateTo }
            });
            const name = `Sales report ${dateFrom} - ${dateTo}`;
            const blob = await response.blob();
            download(blob, `${name}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
    }
}
</script>

<style scoped>
.reports-page-index{
    padding: 2rem !important;
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
</style>