<template>
    <div
        data-v-1372a892=""
        class="vs-input-parent vs-input-parent--state-null
            vs-input-content--has-label
            vs-component--primary vs-textarea"
        :placeholder="placeholder"
    >
        <div class="vs-input-content vs-input-content--has-label">
            <textarea :value="mvalue" @input="taInput" placeholder="" id="vs-input--207" class="vs-input ata" />
            
            <label for="vs-input--207"
                class="vs-input__label">
                {{ placeholder }}
            </label>
            
            <label for="vs-input--207"
                class="vs-input__label vs-input__label--label">
                {{ label }}
            </label>


            <div class="vs-input__affects">
                <div class="vs-input__affects__1"></div>
                <div class="vs-input__affects__2"></div>
                <div class="vs-input__affects__3"></div>
                <div class="vs-input__affects__4"></div>
            </div>

        </div>
    </div>
</template>

<script>
export default {
    props: {
        placeholder: {
            type: String,
            default: ''
        },
        label: {
            type: String,
            default: ''
        },
        value: {
            type: String,
            default: ''
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(value){
                this.mvalue = value;
            }
        }
    },
    data: () => ({
        mvalue: ''
    }),
    methods: {
        taInput(e){
            const val = e.target.value;
            this.$emit('input', val);
        }
    }
}
</script>

<style lang="scss" scoped>
.vs-textarea {
    .vs-input__label--label{
        transform: translate(-3%, -70%) !important;
    }
}
</style>