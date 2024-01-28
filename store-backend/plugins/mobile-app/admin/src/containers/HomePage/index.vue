<template>
    <div class="mobile-app-page-index">
        <section class="card">
            <h2>Mobile App</h2>
            <p>
                Mobile app allows your customers to order food or book a table easly from their smartphones.
            </p>
            <template v-if="!loadingFeatures">
                <template v-if="isEnabled">
                    <p>
                        To Generate mobile app for your restaurant, select store and click generate.
                    </p>

                    <label for="logoFile"><b>Logo</b></label> <br>
                    <input type="file" name="logoFile" ref="logoFile" /> <br>
                    <label for="primaryColor"><b>Primary Color</b></label> <br>
                    <!-- <input v-model.trim="primaryColor" name="primaryColor" placeholder="Format: R,G,B (ex: 247, 184, 10)" /> -->
                    <div style="display: flex;flex-direction: row;">
                        <verte v-model="primaryColor" model="hex" menuPosition="center" :showHistory="null" :enableAlpha="false">
                        </verte>
                        <div style="padding: 2px 6px;user-select: all;">
                            {{ primaryColor }}
                        </div>
                    </div>
                    <br>

                    <div class="spacer r2"></div>

                    <template v-if="loading">
                        <div class="button" disabled>
                            <i class="fas fa-cog fa-spin"></i>
                            Queuing...
                        </div>
                    </template>
                    <template v-else>
                        <button @click="generateClick">
                            Generate
                        </button>
                    </template>
                    <div class="spacer r2"></div>
                    <hr>
                    <div class="spacer r2"></div>
                    <h3>
                        Existing Build
                        <div v-if="refreshing" style="display: inline;">
                            <i class="fas fa-cog fa-spin"></i>
                            Refreshing...
                        </div>
                    </h3>
                    <div v-if="statusData">
                        <table style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>App Name</th>
                                    <th>Status</th>
                                    <th>Creation Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{{ statusData.appDisplayName }}</td>
                                    <td>{{ statusData.status }}</td>
                                    <td>{{ statusData.createdAt | date }}</td>
                                    <td>
                                        <a v-if="statusData.status === 'completed'"
                                            :href="backendURL + '/mobile-app/download-build-output/app-release.apk'">
                                            <button>
                                                Download
                                            </button>
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>
                <template v-else>
                    <p style="font-weight: bold;">
                        Mobile app feature is disabled, Please contact sales if you want to enable it
                    </p>
                </template>
            </template>
        </section>
    </div>
</template>

<script>
import 'vue-select/dist/vue-select.css';
import { request } from 'strapi-helper-plugin';
import verte from 'verte';
import 'verte/dist/verte.css';

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

export default {
    components: {
        verte,
    },
    data: () => ({
        primaryColor: '#1AA05A',
        loading: false,
        refreshing: false,
        statusData: null,
        refreshTimer: null,
        features: null,
        loadingFeatures: true,
    }),
    computed: {
        isEnabled() {
            return !!((this.features || {}).mobile_app)
        },
        backendURL() {
            return strapi.backendURL
        },
        currentStatus() {
            return (this.statusData || {}).status
        }
    },
    methods: {
        async generateClick() {
            if (!this.validateInput()) return
            this.loading = true
            try {
                const file = this.$refs.logoFile.files[0]
                const data = await toBase64(file)
                const fileData = data.split(',')[1]
                await this.sendRequest(fileData)
                alert('Your request has been submitted, Please wait until it is built, You can check current status under "Existing build in the bottom section of the page."')
                this.refreshStatus()
            } catch (error) {
                console.error(error)
                alert('An error occured please try again.')
            }
            this.loading = false
        },
        validateInput() {
            if (this.$refs.logoFile.files.length < 1) {
                alert('Please select a logo file')
            } else if (this.primaryColor.trim().length < 5) {
                alert('Please type in a valid color code in the following format "r, g, b"')
            } else {
                return true
            }
            return false
        },
        async sendRequest(fileData) {
            await request('/mobile-app/request-build', {
                method: 'POST',
                body: {
                    iconFileData: fileData,
                    primaryColor: this.primaryColor
                }
            });
        },
        timerHandler() {
            if (this.currentStatus === 'queued' || this.currentStatus === 'building') {
                this.refreshStatus()
            }
        },
        async refreshStatus() {
            this.refreshing = true
            try {
                const response = await request('/mobile-app/get-status', {
                    method: 'GET',
                });
                this.statusData = response.data
            } catch (error) {
                console.error(error)
            }
            this.refreshing = false
        },
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
    filters: {
        date(v) {
            return new Date(v).toLocaleString()
        }
    },
    mounted() {
        this.refreshStatus()
        this.refreshTimer = setInterval(() => this.timerHandler(), 10000)
        this.loadFeatures()
    },
    beforeDestroy() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer)
        }
    }
}
</script>

<style scoped>
.my-table {
    width: 100%;
}

.my-table th {
    background-color: rgb(247 247 247);
    border-top: 1px solid #007EFF;
}

.my-table th,
.my-table td {
    padding: 0.5rem;
}

.key-data-col {
    max-width: 300px;
}

.key-data-col input {
    background: none;
    border: none;
    width: 100%;
}

.empty-ph {
    padding: 3rem !important;
    text-align: center;
    color: #666;
}

.mobile-app-page-index {
    padding: 2rem !important;
}

h2 {
    margin-bottom: 2rem;
}

.store-select,
input {
    width: 300px;
}

button,
.button {
    display: inline-block;
    position: relative;
    height: 3.4rem;
    width: fit-content;
    padding: 3px 15px 2px;
    font-weight: 600;
    font-size: 1.3rem;
    line-height: normal;
    border-radius: 2px;
    cursor: pointer;
    outline: 0;
    background-color: #007EFF;
    border: 1px solid #007EFF;
    color: #ffffff;
}

button.danger,
.button.danger {
    background-color: #F64D0A;
    border: 1px solid #F64D0A;
}

button:disabled {
    cursor: default;
    opacity: 0.8;
}

.card {
    display: block !important;
    padding: 2rem;
    background: #ffffff;
    border-radius: 2px;
    box-shadow: 0 2px 4px #e3e9f3;
}

input {
    /* width: 100%; */
    height: 3.4rem;
    padding: 0 1rem;
    font-weight: 400;
    font-size: 1.3rem;
    cursor: text;
    outline: 0;
    border: 1px solid #E3E9F3;
    border-radius: 2px;
    color: #333740;
    background-color: transparent;
}

input:focus {
    border-color: #78caff;
}

.spacer {
    width: 100%;
    min-height: 1px;
}

.spacer.r2 {
    height: 2rem;
}</style>

<style>.vs__dropdown-toggle {
    border-radius: 0 !important;
}

.vs__dropdown-toggle>ul {
    border-radius: 0 !important;
}</style>