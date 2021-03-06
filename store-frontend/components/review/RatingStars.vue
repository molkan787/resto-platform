<template>
    <div class="rating-stars" :class="{ mutable }"
        @mouseenter="mouseenter" @mouseleave="mouseleave">
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
            if(this.mutable){
                this.$emit('input', index);
            }
        },
        starHover(index){
            this.tempValue = index;
        },
        mouseenter(){
            if(this.mutable){
                this.showTempValue = true;
            }
        },
        mouseleave(){
            this.showTempValue = false;
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