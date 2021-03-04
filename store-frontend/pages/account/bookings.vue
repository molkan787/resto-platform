<template>
    <Page class="account-bookings-page">
        <div class="page-container no-pad-mobile">
            <div class="table-wrapper">
                <h1 class="p-color">Bookings</h1>
                <vs-table>
                    <template #thead>
                        <vs-tr>
                            <vs-th> Date </vs-th>
                            <vs-th> Time </vs-th>
                            <vs-th> Number of persons </vs-th>
                            <vs-th> Status </vs-th>
                        </vs-tr>
                    </template>
                    <template #tbody>
                        <vs-tr
                            :key="i"
                            v-for="(tr, i) in bookings"
                            :data="tr"
                            @click="showBooking(tr)"
                        >
                            <vs-td>
                                {{ tr.date | date_only }}
                            </vs-td>
                            <vs-td>
                                {{ tr.time | strapi_time }}
                            </vs-td>
                            <vs-td>
                                {{ tr.number_of_persons }}
                            </vs-td>
                            <vs-td>
                                {{ tr.status | capitalize }}
                            </vs-td>
                        </vs-tr>
                    </template>
                </vs-table>
            </div>
        </div>
        <vs-dialog v-model="showBookingDialog" ref="dialog" width='400px' :auto-width="false">
            <template #header>
                <h3>Booking</h3>
            </template>
            <h4><span class="opacity-07">Date: </span> {{ booking.date | date_only }}</h4>
            <h4><span class="opacity-07">Time: </span> {{ booking.time | strapi_time }}</h4>
            <h4><span class="opacity-07">Number of persons:</span> {{ booking.number_of_persons }}</h4>
            <h4><span class="opacity-07">Status: </span> {{ booking.status | capitalize }}</h4>
            <template #footer>
                <vs-button color="danger" v-if="booking.status == 'booked'" @click="cancelBookingClick" :loading="cancelLoading" flat size="large" block>
                    Cancel this booking
                </vs-button>
            </template>
        </vs-dialog>
    </Page>
</template>

<script>
import Vue from 'vue';
export default {
    async asyncData({ $strapi }) {
        const bookings = await $strapi.find("booking/bookings/my", {
            _sort: "id:DESC",
        });
        return {
            bookings,
        };
    },
    data: () => ({
        showBookingDialog: false,
        booking: {},
        cancelLoading: false,
    }),
    methods: {
        showBooking(booking){
            this.booking = booking;
            this.showBookingDialog = true;
        },
        async cancelBookingClick(){
            if(confirm(`Cancel table booking on ${Vue.filter('date_only')(this.booking.date)} ?`)){
                this.cancelLoading = true;
                try {
                    await this.$strapi.update('booking/bookings/cancelmy', this.booking.id, {});
                    this.booking.status = 'canceled';
                    this.showBookingDialog = false;
                } catch (error) {
                    console.error(error);
                    alert('An error occured, Please try again');
                }
                this.cancelLoading = false;
            }
        }
    },
};
</script>

<style lang="scss">
.account-bookings-page {
    h1{
        margin-bottom: 1rem;
        @media only screen and (max-width: 768px) {
            padding: 1rem;
            margin-bottom: 0;
            text-align: center;
        }
    }
    .table-wrapper {
        padding: 4rem;
        @media only screen and (max-width: 768px) {
            padding: 0rem;
        }
    }
    .vs-table__tr {
        cursor: pointer;
    }
}
</style>