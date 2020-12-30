<template>
  <vs-navbar center-collapsed>
    <template #left>
      <!-- <img src="/logo2.png" alt="" /> -->
    </template>
    <vs-navbar-item :active="active == 'index'" to="/">
      HOME
    </vs-navbar-item>

    <template v-if="stores.length > 1">
      <vs-navbar-group>
        ORDER ONLINE
        <template #items>
          <vs-navbar-item v-for="store in stores" :key="store.id" :active="activeStoreSlug == store.slug" :to="`/order/${store.slug}`">
            {{ store.name }}
          </vs-navbar-item>
        </template>
      </vs-navbar-group>
    </template>
    <template v-else>
      <vs-navbar-item :active="active == 'order'" :to="`/order/${(stores[0] || {}).slug}`">
        ORDER ONLINE
      </vs-navbar-item>
    </template>

    <vs-navbar-item :active="active == 'gallery'" to="/gallery">
      GALLERY
    </vs-navbar-item>

    <template #right>
      <template v-if="user">
        <vs-navbar-group>
          <span class="user-fullname">
            <i class="bx bxs-user"></i>
            {{ user.fullname }}
          </span>
          <template #items>
            <vs-navbar-item :active="active == 'account-settings'" to="/account/settings">
              Settings
            </vs-navbar-item>
            <vs-navbar-item :active="active == 'account-orders'" to="/account/orders">
              Order history
            </vs-navbar-item>
            <vs-navbar-item @click="logoutClick">
              Logout
            </vs-navbar-item>
          </template>
        </vs-navbar-group>
      </template>
      <template v-else>
        <vs-button @click="loginClick" flat>Login</vs-button>
        <vs-button @click="registerClick">Register</vs-button>
      </template>
    </template>
  </vs-navbar>
</template>

<script>
import { mapState } from 'vuex';
export default {
  methods: {
    itemClick(value){
      console.log()
    },
    registerClick(){
      openAuthModal('register');
    },
    loginClick(){
      openAuthModal('login');
    },
    logoutClick(){
      this.$strapi.logout();
      this.$router.push('/');
    }
  },
  computed:{
    ...mapState(['stores']),
    user(){
      return this.$strapi.user;
    },
    active(){
      return this.$route.name;
    },
    activeStoreSlug(){
      return this.$route.params.store;
    }
  }
};
</script>

<style lang="scss">
.vs-navbar-content{
  position: relative !important;
  .user-fullname{
    min-width: 120px;
    display: inline-block;
  }
}
</style>