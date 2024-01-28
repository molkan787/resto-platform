<template>
    <div>
        <h2>Your Apps</h2>
        <hr style="margin-top: 14px;margin-bottom: 12;" />

        <h4 style="margin-bottom: 2px;">Website:</h4>
        <a v-if="frontendURL" :href="frontendURL" target="_blank">
            {{ frontendURL }}
        </a>
        <span class="low" v-else>This feature is not enabled</span>

        <div style="height: 12px;"></div>

        <h4 style="margin-bottom: 2px;">Mobile App:</h4>
        <a v-if="isMobileAppEnabled" href="/admin/plugins/mobile-app">Generate App</a>
        <span class="low" v-else>This feature is not enabled</span>

        <div style="height: 12px;"></div>

        <h4 style="margin-bottom: 2px;">POS App:</h4>
        <a v-if="isDesktopPOSEnabled" href="/admin/plugins/pos-sync">Configure</a>
        <span class="low" v-else>This feature is not enabled</span>

        <div style="height: 12px;"></div>
    </div>
</template>

<script>
import { request } from 'strapi-helper-plugin';
export default {
    data: () => ({
        features: null
    }),
    computed: {
        frontendURL(){
            return ((this.features || {}).website || {}).url || false
        },
        isMobileAppEnabled(){
            return (this.features || {}).mobile_app || false
        },
        isDesktopPOSEnabled(){
            return (this.features || {}).desktop_pos || false
        }
    },
    methods: {
        async loadFeatures(){
            try {
                const data = await request('/platform-features/features', { method: 'GET' })
                console.log(data.features)
                this.features = data.features
                this.loadingFeatures = false
            } catch (error) {
                console.error('An error occured while loading vendor features')
                console.error(error)
            }
        }
    },
    mounted(){
        this.loadFeatures()
    }
}
</script>

<style scoped>
h1{
    margin-bottom: 22px;
}
.mtd{
    padding-right: 28px;
}
.big-number{
    color: #007bff;
    font-size: 42px;
}
.big-number-2{
    color: #007bff;
    font-size: 32px;
}
.st-name{
    padding-top: 12px;
    padding-left: 4px;
    font-size: 16px;
}
.low{
    opacity: 0.7;
}
</style>