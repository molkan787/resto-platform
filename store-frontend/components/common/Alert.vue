<template>
    <vs-dialog v-model="isOpen" ref="dialog" width='400px' :auto-width="false">
        <template #header>
            <h3>{{ title }}</h3>
        </template>
        {{ text }}
        <template #footer>
            <vs-button @click="isOpen = false" flat size="large" block>
                OK
            </vs-button>
        </template>
    </vs-dialog>
</template>

<script>
export default {
    data: () => ({
        isOpen: false,
        title: '',
        text: ''
    }),
    methods: {
        open(text, title){
            this.text = text;
            this.title = title || '';
            this.isOpen = true;
        }
    },
    created(){
        if(process.client){
            window.alert = (...args) => this.open(...args);
        }
    }
}
</script>