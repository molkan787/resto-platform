<template>
    <div class="rating-stars" :class="{ mutable }"
        @mouseenter="showTempValue = true" @mouseleave="showTempValue = false">
        <i v-for="star in [1, 2, 3, 4, 5]" :key="star"
            class='bx' :class="displayValue >= star ? 'bxs-star' : 'bx-star'"
            @mouseenter="starHover(star)"
            @click="starClick(star)"
        ></i>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            type: Number,
            default: 0
        },
        mutable: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        displayValue(){
            return this.showTempValue ? this.tempValue : this.value;
        }
    },
    data: () => ({
        tempValue: 0,
        showTempValue: false
    }),
    methods: {
        starClick(index){
            this.$emit('input', index);
        },
        starHover(index){
            this.tempValue = index;
        }
    }
}
</script>

<style lang="scss" scoped>
.rating-stars{
    display: inline-block;
    color: rgb(255, 196, 0);
    &.mutable{
        i{
            cursor: pointer;
        }
    }
}
</style>