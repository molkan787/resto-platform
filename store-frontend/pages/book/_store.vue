<template>
    <Page class="book-page" title="Book a table">
        <div class="total-center-wrapper">
            <div class="total-center">
                <div class="my-content">
                <div class="row">
                    <div style="flex: 1">
                        <div style="margin-top: -1rem">
                            <StoreInfo :store="store" />
                        </div>
                        <div class="content-block">
                            <h2>Book a table</h2>
                            <p>
                                To book a table please select the date and time, <br>
                                and then click the Book button
                            </p>
                        </div>
                    </div>
                    <div>
                        <vs-card>
                            <template #text>
                                <BookingOptions :store="store" v-model="booking" :loading="loading" />
                                <vs-button @click="bookClick" :loading="loading" :disabled="!booking.time" class="book-button" size="large">Book</vs-button>
                            </template>
                        </vs-card>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </Page>
</template>

<script>
export default {
    asyncData(ctx){
        return {
            store: ctx.$appService.getStoreBySlug(ctx.params.store)
        }
    },
    data: () => ({
        loading: false,
        booking: {
            date: null,
            time: '',
            number_of_persons: 'n2n'
        },
    }),
    methods: {
        bookClick(){
            const data = Object.assign({}, this.booking);
            data.number_of_persons = parseInt(data.number_of_persons.split('n')[1]);
            data.store_id = this.store.id
            this.book(data);
        },
        async book(data){
            this.loading = true;
            try {
                await this.$strapi.create('booking/bookings', data);
                this.clearForm();
                alert('The table was successfully booked!');
            } catch (error) {
                console.error(error);
                alert('An error occured, Please make sure you are connected to the internet');
            }
            this.loading = false;
        },
        clearForm(){
            this.booking = {
                 date: null,
                time: '',
                number_of_persons: 'n2n'
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.book-page{
    .total-center-wrapper{
        display: table;
        width: 100%;
        height: calc(100vh - 260px);
        .total-center{
            display: table-cell;
            vertical-align: middle;
            
        }
    }
    .content-block{
        display: block;
        padding: 1rem;
        h2{
            margin-bottom: 0.5rem;
        }
        p{
            padding: 0;
            margin-bottom: 1rem;
        }
    }
    .my-content{
        width: fit-content;
        min-width: 800px;
        margin: auto;
        padding-top: 2rem;
        & > .row{
            display: flex;
            justify-content: space-between;
            &.center{
                justify-content: space-around;
            }
        }
    }
}
</style>

<style lang="scss">
.book-page{
    .book-button{
        margin-top: 1rem;
        width: 300px;
    }
    .vs-card{
        width: 333px;
    }
}
</style>