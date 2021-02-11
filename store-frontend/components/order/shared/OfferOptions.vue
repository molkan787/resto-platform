<template>
    <div class="offer-options">
        <template v-if="benefitType == 'free_items'">
            <h4>Select your free item</h4>
            <div class="select-items-wrapper">
                <vs-select
                    :key="'offer-free-items-select' + selectKey"
                    filter
                    multiple
                    placeholder="Select a free item"
                    v-model="bucket.selectedItems"
                >
                    <vs-option v-for="item in availableItems" :key="item.id"
                        :label="item.name" :value="item.id">
                        {{ item.name }} ({{ item.price | price }})
                    </vs-option>
                    <template v-if="error" #message-danger>
                        {{ error }}
                    </template>
                </vs-select>
            </div>
        </template>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
    props: {
        offer: {
            type: Object,
        },
        bucket: {
            type: Object,
            required: true
        },
        error: {
            type: String,
            default: null
        }
    },
    watch: {
        availableItems(){
            this.selectKey++;
        }
    },
    computed: {
        ...mapState(['products']),
        benefit(){
            const { benefits } = this.offer || {};
            const benefit = benefits[0];
            return benefit || null;
        },
        benefitType(){
            return this.benefit && this.benefit.type || null;
        },
        availableItems(){
            const benefit = this.benefit;
            if(benefit){
                const { all_items, items } = benefit;
                return all_items ? Array.from(this.products.values()) : items;
            }
            return [];
        }
    },
    data: () => ({
        selectKey: 1,
    })
}
</script>

<style lang="scss" scoped>
.select-items-wrapper{
    padding: 1rem 0 1rem 0;
}
</style>

<style lang="scss">
.select-items-wrapper{
    .vs-select-content {
        width: 100%;
        max-width: 400px;
    }
}
</style>