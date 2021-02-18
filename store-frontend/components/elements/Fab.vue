<template>
    <div class="fab">
        <vs-button @click="$emit('click', $event)" class="actual-button">
            <i :class='`bx ${icon}`'></i>
        </vs-button>
        <span v-if="typeof counter == 'number'" class="counter">
            {{ counter }}
        </span>
    </div>
</template>

<script>
export default {
    props: {
        icon: {
            type: String,
            required: true,
        },
        counter: {
            type: Number,
            default: null
        }
    }
}
</script>

<style lang="scss" scoped>
.fab{
    $wdith: 70px;
    $mar: 20px;
    z-index: var(--vs-zindex-1);
    position: fixed;
    bottom: $mar;
    left: $mar;
    width: $wdith;
    height: $wdith;
    .actual-button{
        width: $wdith;
        height: $wdith;
        background-color: rgba(var(--vs-primary), 0.8);
        backdrop-filter: blur(7px);
        box-shadow: 1px 1px 12px rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        font-size: 40px;
    }
    .counter{
        $w: 24px;
        z-index: 1;
        position: absolute;
        top: 2px;
        right: 2px;
        width: $w;
        height: $w;
        border-radius: 50%;
        background-color: rgba(var(--vs-primary), 1);
        color: white;
        text-align: center;
        font-size: 16px;
        padding-top: 2px;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
    }
}
</style>