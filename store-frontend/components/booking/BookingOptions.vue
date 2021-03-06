<template>
    <div class="booking-options">
        <client-only>
            <Datepicker
                v-model="booking.date"
                :disabled-dates="disabledDates"
                placeholder="Select a date"
                input-class="vs-input my-datepicker-input"
                calendar-class="my-datepicker-calendar"
                wrapper-class="my-datepicker-wrapper"
                maximum-view="day"
                :inline="true"
                :disabled="loading"
            />
        </client-only>

        <vs-select
            :key="timeSelectKey"
            :disabled="!day || loading"
            label="Time"
            placeholder="Select Time"
            v-model="booking.time"
        >
            <vs-option v-for="slot in timeSlots" :key="slot.id" :value="slot.time" :label="slot | timeSlotText">
                {{ slot | timeSlotText }}
            </vs-option>

        </vs-select>

        <vs-select label="Category" v-model="booking.category" :disabled="loading" >
            <vs-option value="breakfast" label="Breakfast">Breakfast</vs-option>
            <vs-option value="lunch" label="Lunch">Lunch</vs-option>
            <vs-option value="dinner" label="Dinner">Dinner</vs-option>
        </vs-select>

        <vs-select
            label="Number of persons"
            placeholder="Number of persons"
            filter
            :multiple="false"
            v-model="booking.number_of_persons"
            :disabled="loading"
        >
            <vs-option v-for="n in numbers" :key="'n-' + n.value" :value="n.value" :label="n.label">
                {{ n.label }}
            </vs-option>

        </vs-select>

    </div>
</template>

<script>
import { TextUtils, Interfaces, DataUtils } from 'murew-core';
export default {
    props: {
        store: {
            type: Object,
            required: true
        },
        value: {
            type: Object,
            default: () => ({
                date: null,
                time: '',
                number_of_persons: 'n2n'
            })
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        bookingSlots(){
            return this.store.booking_slots;
        },
        day(){
            return this.booking.date ? TextUtils.getDayNameFromDate(this.booking.date) : null
        },
        timeSlots(){
            const daySlot = this.slots.get(this.day);
            return daySlot && daySlot.time_slots || [];
        }
    },
    data: () => ({
        disabledDates: {},
        slots: new Map(),
        timeSelectKey: 1,
        numbers: '-'.repeat(50).split('').map((c, i) => {
            const n = i + 1;
            return {
                value: 'n' + (i + 1).toString() + 'n',
                label: n == 1 ? '1 Person' : `${n} Persons`
            }
        }),
        booking: null
    }),
    watch: {
        value: {
            immediate: true,
            deep: false,
            handler(){
                this.booking = this.value;
            }
        },
        bookingSlots: {
            immediate: true,
            handler(){
                this.updateSlotsMap();
                this.updateDisabledDays();
            }
        },
        'booking.date'(){
            this.booking.time = '';
            this.timeSelectKey++;
        },
        'booking.time'(){
            this.$emit('input', this.booking);
        }
    },
    methods: {
        updateSlotsMap(){
            this.slots = DataUtils.arrayToMap(this.bookingSlots, 'day');
        },
        updateDisabledDays(){
            const days = [].concat(Interfaces.Days);
            const disabledDays = [];
            days.forEach((day, index) => {
                const si = this.bookingSlots.findIndex(s => s.day == day);
                if(si == -1) disabledDays.push(index);
            })
            this.disabledDates.days = disabledDays;
        }
    },
    created(){
        if(process.client){
            const laterDate = new Date();
            laterDate.setMonth(laterDate.getMonth() + 3);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            this.disabledDates = {
                to: yesterday,
                from: laterDate,
                days: this.disabledDates.days || Array.from(Interfaces.Days.keys())
            }
        }
    },
    filters: {
        timeSlotText(slot){
            const parts = slot.time.split(':');
            return parts.slice(0, 2).join(':');
        }
    }
}
</script>

<style lang="scss">
.booking-options{
    .vs-select, .nop-input{
        width: 300px;
        margin-top: 1.5rem;
        input{
            width: 300px;
        }
    }
    .enable-checkbox .vs-checkbox-label{
        font-size: 1.17em;
        font-weight: bold;
    }
    .my-datepicker-input{
        border-radius: 12px;
        padding: 7px 13px;
        font-size: 16px;
    }
    .my-datepicker-calendar{
        border: none !important;
        padding: 0.5rem;
        overflow: hidden;
        header span{
            border-radius: 12px;
        }
        .cell{
            &.selected, &.selected:hover{
                background-color: rgba(var(--vs-primary), 1);
                color: white;
            }
            &:not(.blank):not(.disabled){
                &.day, &.month, &.year {
                    border: 1px solid transparent;
                    border-radius: 12px;
                    &:hover{
                        border: 1px solid rgba(var(--vs-primary), 1);
                    }
                }
                &.day:not(.selected){
                    background-color: rgba(var(--vs-primary), 0.2);
                }
            }
        }
    }
    .my-datepicker-wrapper{
        width: fit-content;
        margin-right: 1rem;
    }
}
</style>