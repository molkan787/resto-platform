<template>
    <vs-sidebar :open.sync="isOpen">

        <template #logo>
            <img :src="layoutSettings.website_logo" alt="logo" />
        </template>

        <vs-sidebar-item :active="active == 'index'" to="/">
            HOME
        </vs-sidebar-item>
        <template v-if="stores.length > 1">
            <vs-sidebar-group>
                <template #header>
                    <vs-sidebar-item arrow>
                        ORDER ONLINE
                    </vs-sidebar-item>
                </template>
                <vs-sidebar-item
                    v-for="store in stores"
                    :key="store.id"
                    :active="activeStoreSlug == store.slug"
                    :to="`/order/${store.slug}`"
                >
                    {{ store.name | capitalize }}
                </vs-sidebar-item>
            </vs-sidebar-group>
        </template>
        <template v-else>
            <vs-sidebar-item
                :active="active == 'order'"
                :to="`/order/${(stores[0] || {}).slug}`"
            >
                ORDER ONLINE
            </vs-sidebar-item>
        </template>

        <template v-if="bookableStores.length > 1">
            <vs-sidebar-group>
                <template #header>
                    <vs-sidebar-item arrow>
                        BOOK TABLE
                    </vs-sidebar-item>
                </template>
                <vs-sidebar-item
                    v-for="store in stores"
                    :key="store.id"
                    :active="activeStoreSlug == store.slug"
                    :to="`/book/${store.slug}`"
                >
                    {{ store.name | capitalize }}
                </vs-sidebar-item>
            </vs-sidebar-group>
        </template>
        <template v-else-if="bookableStores.length == 1">
            <vs-sidebar-item
                :active="active == 'order'"
                :to="`/book/${(stores[0] || {}).slug}`"
            >
                BOOK TABLE
            </vs-sidebar-item>
        </template>

        <vs-sidebar-item :active="active == 'gallery'" to="/gallery">
            GALLERY
        </vs-sidebar-item>

        <vs-sidebar-item
            v-for="page in navPages"
            :key="page.slug"
            :active="active == page.slug"
            :to="'/p/' + page.slug"
        >
            {{ page.name | uppercase }}
        </vs-sidebar-item>

        <!-- <template #footer>
            <template v-if="user">
                <vs-sidebar-group>
                    <template #header>
                        <vs-sidebar-item arrow>
                            <span class="user-fullname">
                                <i class="bx bxs-user"></i>
                                {{ user.fullname || user.username }}
                            </span>
                        </vs-sidebar-item>
                    </template>
                    <vs-sidebar-item
                        :active="active == 'account-settings'"
                        to="/account/settings"
                    >
                        Settings
                    </vs-sidebar-item>
                    <vs-sidebar-item
                        :active="active == 'account-orders'"
                        to="/account/orders"
                    >
                        Order history
                    </vs-sidebar-item>
                    <vs-sidebar-item @click="logoutClick">
                        Logout
                    </vs-sidebar-item>
                </vs-sidebar-group>
            </template>

            <template v-else>
                <vs-button @click="loginClick" flat>Login</vs-button>
                <vs-button @click="registerClick">Register</vs-button>
            </template>
        </template> -->

    </vs-sidebar>
</template>

<script>
import { mapState } from "vuex";
export default {
    props: {
        value: {
            type: Boolean,
            default: false,
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(value){
                this.isOpen = value;
            }
        },
        isOpen(){
            this.$emit('input', this.isOpen);
        }
    },
    data: () => ({
        isOpen: false,
    }),
    methods: {
        registerClick() {
            openAuthModal("register");
        },
        loginClick() {
            openAuthModal("login");
        },
        logoutClick() {
            this.$strapi.logout();
            this.$router.push("/");
        },
    },
    computed: {
        ...mapState(["stores", "pages", "layoutSettings"]),
        user() {
            return this.$strapi.user;
        },
        active() {
            return this.$route.name;
        },
        activeStoreSlug() {
            return this.$route.params.store;
        },
        navPages() {
            return this.pages.filter((p) => p.show_in_navigation_menu);
        },
        bookableStores() {
            return this.stores.filter((s) => s.enable_booking);
        },
    },
};
</script>