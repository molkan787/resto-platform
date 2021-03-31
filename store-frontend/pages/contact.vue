<template>
    <Page title="Contact" class="contact-page">
        <div class="container">
            <br>
            <br>
            <br>
            <div class="row">
                <div class="info">
                    <div class="address">
                        <h2 class="p-color">{{ store.name | capitalize }}</h2>
                        <div v-for="addr in address" :key="addr">
                            {{ addr }}
                        </div>
                    </div>
                    <h3 style="margin-bottom: 1rem">Opening Hours</h3>
                    <table>
                        <tbody>
                            <tr v-for="oh in openingHours" :key="oh.day">
                                <td>{{ oh.day }}</td>
                                <td>{{ oh.shifts | shiftsText }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="location">
                    <div class="map">
                        <google-map class="map" :center="position" :zoom="14">
                            <google-map-marker
                                visible
                                :position="position"
                            />
                        </google-map>
                    </div>
                </div>
            </div>
            <div class="contact">
                <h2>Contact us</h2>
                <h4 v-if="store.contact_phone">Tel: {{ store.contact_phone }}</h4>
                <div class="contact-form">
                    <vs-input :disabled="loading" v-model.trim="form.full_name" label="Full Name *" placeholder="Full Name" />
                    <vs-input :disabled="loading" v-model.trim="form.email" label="Email *" placeholder="Email" />
                    <vs-input :disabled="loading" v-model.trim="form.phone" label="Phone" placeholder="Phone" />
                    <textarea :disabled="loading" v-model.trim="form.subject" cols="30" rows="10" placeholder="Subject *" />
                    <vs-button :loading="loading" @click="sendClick" size="large">Send Message</vs-button>
                </div>
            </div>
        </div>
    </Page>
</template>

<script>
import { mapState } from 'vuex';
import { Days } from 'murew-core/dist/interfaces';
export default {
    computed: {
        ...mapState(['stores']),
        store(){
            return this.stores[0] || {};
        },
        position(){
            const { latitude, longitude } = this.store.address || {};
            return {
                lat: latitude || 0,
                lng: longitude || 0
            };
        },
        address(){
            const { line1, line2, city, postcode } = this.store.address || {};
            return [line1, line2, city, postcode].filter(p => !!p);
        },
        openingHours(){
            const { opening_hours } = this.store;
            const items = [];
            for(let day of Days){
                const shifts = opening_hours[day.toLowerCase()];
                items.push({
                    day: day,
                    shifts: shifts && shifts.length ? shifts : null
                })
            }
            return items;
        }
    },
    data: () => ({
        loading: false,
        form: {
            full_name: '',
            email: '',
            phone: '',
            subject: ''
        }
    }),
    methods: {
        sendClick(){
            if(this.validateForm()){
                this.postMessage();
            }else{
                alert('Please fill all requried fields. (fields marker with *)')
            }
        },
        validateForm(){
            const { full_name, email, subject } = this.form;
            if(!full_name || !email || !subject){
                return false;
            }
            return true;
        },
        async postMessage(){
            this.loading = true;
            try {
                await this.$strapi.create('contact-messages', this.form);
                this.clearForm();
                alert('Your message was successfully sent, We\'ll get back to you as soon as possible.')
            } catch (error) {
                console.error(error);
                alert('An error occured, Please try again.')
            }
            this.loading = false;
        },
        clearForm(){
            this.form = {
                full_name: '',
                email: '',
                phone: '',
                subject: ''
            };
        }
    },
    filters: {
        shiftsText(shifts){
            if(shifts){
                return shifts.map(
                            ({ opens_at, closes_at }) =>
                                [opens_at, closes_at]
                                .map(tt => tt.split(':').slice(0, 2).join(':'))
                                .join(' - ')
                        ).join(' , ');
            }else{
                return 'Closed'
            }
        }
    },
    mounted(){
        
    }
}
</script>

<style lang="scss" scoped>
.row{
    display: flex;
    flex-direction: row;
}
.address{
    padding: 0 0 1rem 0;
}
.info{
    padding: 0 2rem;
}
.map{
    width: 540px;
    height: 320px;
}
.contact{
    text-align: center;
    padding: 4rem 0;
    .contact-form{
        display: grid;
        grid-template-columns: repeat(2, calc((100% - 1rem) / 2));
        column-gap: 1rem;
        row-gap: 1.5rem;
        width: 700px;
        margin: auto;
        margin-top: 3rem;
        @media screen and (max-width: 768px) {
            width: 100%;
        }
        textarea, button{
            grid-column: span 2;
        }
    }
}
</style>

<style lang="scss">
.contact-page{
    .contact-form{
        .vs-input-content input{
            width: 100%;
        }
    }
}
</style>