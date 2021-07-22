<template>
    <div class="pos-sync-page-index">
        <section class="card">
            <h2>Booking</h2>

            <div class="filters">
                <table>
                    <thead>
                        <tr>
                            <!-- <th>Select store</th> -->
                            <th>Date</th>
                            <th>Customer Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <!-- <td>
                                <vSelect v-model="selectedStore" class="store-select" :options="stores" :clearable="false" />
                            </td> -->
                            <td>
                                <input v-model="selectedDate" type="date" id="booking_show_date" />
                            </td>
                            <td>
                                <input v-model.trim="customerName" type="text" placeholder="Search by customer name" >
                                <button @click="customerName = ''" class="clear-btn gray" title="Clear customer name">
                                    <i class="far fa-times-circle"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="spacer r2"></div>
            <h3>
                Booked slots ({{ dateText }})
                <span v-if="loading" class="refreshing">refreshing...</span>
            </h3>
            <div class="items">
                <table class="my-table">
                <thead>
                    <tr>
                        <th>NO</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Note</th>
                        <th>Status</th>
                        <th> </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="items.length < 1">
                        <td class="empty-ph" colspan="5">There is no booking for the selected date</td>
                    </tr>
                    <tr v-for="k in items" :key="k.id">
                        <td>{{ k.no }}</td>
                        <td>
                            <strong>{{ k.time | timeText }}</strong> <br>
                            {{ new Date(k.date).toLocaleDateString() }}
                        </td>
                        <td>
                            <strong>{{ k.number_of_persons }} Persons</strong> <br>
                            {{ k.category }}
                        </td>
                        <td><b>{{ k.customer_name }}</b></td>
                        <td>{{ k.customer_phone }}</td>
                        <td style="max-width: 200px;">{{ k.comment || '---' }}</td>
                        <td>
                            <strong>{{ k.status }}</strong>
                        </td>
                        <td>
                            <button v-if="k.status != 'canceled'" @click="cancelClick(k)" class="danger">
                                <i class="fas fa-ban"></i>
                                Cancel
                            </button>
                            <button v-if="k.status != 'arrived'" @click="arrivedClick(k)">
                                <i class="fas fa-sign-in-alt"></i>
                                Arrived
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>
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
        selectedDate: '',
        customerName: '',
        loading: false,
        bookings: [],
        refreshTimer: null
    }),
    watch: {
        selectedDate(){
            this.loadBookings();
        }
    },
    computed: {
        dateText(){
            return this.selectedDate ? this.selectedDate : 'Today'
        },
        getSelectedDate(){
            return this.selectedDate || this.formatDate(new Date());
        },
        items(){
            if(this.customerName){
                const names = this.customerName.toLowerCase().split(' ').map(n => n.replace(/\s/g, '')).filter(n => !!n);
                const name_f = names.join(' ');
                const name_b = names.reverse().join(' ');
                return this.bookings.filter(b => {
                    let cn = b.customer_name;
                    if(typeof cn == 'string'){
                        cn = cn.toLowerCase();
                        return cn.includes(name_f) || cn.includes(name_b);
                    }
                    return false;
                });
            }else{
                return this.bookings;
            }
        }
    },
    methods: {
        async loadBookings(){
            this.loading = true;
            try {
                const bookings = await request('/booking/bookings', {
                    method: 'GET',
                    params: {
                        date: this.getSelectedDate,
                        store_id: window.localStorage.getItem('murew_store_id')
                    }
                });
                this.bookings = bookings;
            } catch (error) {
                console.error(error);
                strapi.notification.error(error.toString());
            }
            this.loading = false;
        },
        cancelClick(booking){
            if(confirm(`Cancel the booking for ${booking.customer_name} ?`)){
                this.cancelBooking(booking);
            }
        },
        arrivedClick(booking){
            if(confirm(`Does the customer ${booking.customer_name} arrived ?`)){
                this.markBookingAsArrived(booking);
            }
        },
        async cancelBooking(booking){
            try {
                await request(`/booking/bookings/cancel/${booking.id}`, {
                    method: 'POST'
                });
                booking.status = 'canceled';
                strapi.notification.success('Booking successfully canceled!');
            } catch (error) {
                console.error(error);
                strapi.notification.error(error.toString());
            }
        },
        async markBookingAsArrived(booking){
            try {
                await request(`/booking/bookings/arrived/${booking.id}`, {
                    method: 'POST'
                });
                booking.status = 'arrived';
                strapi.notification.success('Booking successfully marked as Arrived!');
            } catch (error) {
                console.error(error);
                strapi.notification.error(error.toString());
            }
        },
        formatDate(date) {
            var d = date,
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) 
                month = '0' + month;
            if (day.length < 2) 
                day = '0' + day;

            return [year, month, day].join('-');
        }
    },
    mounted(){
        this.loadBookings();
        this.refreshTimer = setInterval(() => this.loadBookings(), 10 * 1000);
    },
    beforeDestroy(){
        if(this.refreshTimer) clearInterval(this.refreshTimer);
    },
    filters: {
        timeText(time){
            return time.split(':').slice(0, 2).join(':');
        }
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
    padding: 1rem 0.5rem 0.5rem 0.5rem;
    text-transform: capitalize;
    vertical-align: top;
}
.my-table tr:nth-child(even){
    background-color: #f9f9f9;
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
    transition: opacity 0.2s;
}
button.gray, .button.gray{
    background-color: #e9e9e9;
    border: 1px solid #e9e9e9;
    color: rgb(71, 71, 71);
}
button.danger, .button.danger{
    background-color: #F64D0A;
    border: 1px solid #F64D0A;
}
button:disabled, .button:disabled{
    cursor: default;
    opacity: 0.8;
}
button:active, .button:active{
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
</style>

<style>
.vs__dropdown-toggle{
    border-radius: 0 !important;
}
.vs__dropdown-toggle > ul{
    border-radius: 0 !important;
}
</style>

<style>
.vs__dropdown-toggle{
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
.vs__dropdown-menu{
    border-radius: 0 !important;
}
.vs__dropdown-option--highlight{
    background-color: #007EFF !important;
}
</style>