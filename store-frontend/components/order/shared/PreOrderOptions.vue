<template>
    <div class="preorder-options">
        <vs-checkbox v-model="preorder.enabled" class="enable-checkbox">Preorder for later?</vs-checkbox>
        <div v-if="preorder.enabled" class="options">
            <client-only>
                <Datepicker
                    v-model="preorder.date"
                    :disabled-dates="disabledDates"
                    placeholder="Select a date"
                    input-class="vs-input my-datepicker-input"
                    calendar-class="vs-card my-datepicker-calendar"
                    wrapper-class="my-datepicker-wrapper"
                    maximum-view="day"
                />
            </client-only>
            <vs-select
                :key="timeSelectKey"
                v-if="day"
                v-model="preorder.time"
                placeholder="Select Time"
                filter
            >
                <vs-option v-for="slot in timeSlots" :key="slot" :disabled="slot == '-'" :value="slot" :label="slot">
                    {{ slot == '-' ? '---' : slot }}
                </vs-option>

            </vs-select>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { TextUtils, Interfaces } from 'murew-core';
export default {
    computed: {
        ...mapState({
            activeStore: state => state.activeStore,
            preorder: state => state.checkout.preorder
        }),
        openingDays(){
            const s = this.activeStore;
            return (s && s.opening_hours) || {}
        },
        day(){
            return this.preorder.date ? TextUtils.getDayNameFromDate(this.preorder.date).toLowerCase() : null
        },
        timeSlots(){
            const shifts = this.openingDays[this.day] || [];
            const slots = [];
            for(const shift of shifts){
                if(slots.length){
                    slots.push('-');
                }
                const { opens_at, closes_at } = shift;
                const mins = opens_at.split(':'), maxs = closes_at.split(':');
                const minHour = parseInt(mins[0]), minMinute = Math.ceil(parseInt(mins[1]) / 15) * 15;
                const maxHour = parseInt(maxs[0]), maxMinute = Math.floor(parseInt(maxs[1]) / 15) * 15;
                if(minHour > maxHour) continue;
                let h = minHour, m = minMinute;
                while(h < maxHour || (h == maxHour && m < maxMinute)){
                    m += 15;
                    if(m == 60){ m = 0; h++; }
                    slots.push(`${('0'+h).substr(-2)}:${('0'+m).substr(-2)}`);
                }
            }
            return slots;
        },
    },
    data: () => ({
        disabledDates: {},
        timeSelectKey: 1
    }),
    watch: {
        openingDays: {
            immediate: true,
            handler(){
                this.updateDisabledDays();
            }
        },
        'preorder.date'(){
            this.preorder.time = '';
            this.timeSelectKey++;
        }
    },
    methods: {
        updateDisabledDays(){
            const days = Interfaces.Days.map(d => d.toLowerCase());
            const disabledDays = [];
            days.forEach((dayname, index) => {
                const day = this.openingDays[dayname];
                if(!day || day.length < 1) disabledDays.push(index);
            })
            this.disabledDates.days = disabledDays;
        }
    },
    created(){
        if(process.client){
            const weekLater = new Date();
            weekLater.setMonth(weekLater.getMonth() + 1);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            this.disabledDates = {
                to: yesterday,
                from: weekLater,
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

<style lang="scss" scoped>
.preorder-options{
    .options{
        padding: 1rem 0;
        display: flex;
        
    }
}
</style>

<style lang="scss">
.preorder-options{
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