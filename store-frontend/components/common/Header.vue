<template>
  <vs-navbar :class="{ large, sticky }" class="navbar" center-collapsed>
    <template #left>
      <nuxt-link to="/">
        <img src="~/assets/images/logo.jpg" alt="logo" style="height: 44px;pointer-events: none;" />
      </nuxt-link>
    </template>
    <vs-navbar-item :active="active == 'index'" to="/">
      HOME
    </vs-navbar-item>

    <template v-if="stores.length > 1">
      <vs-navbar-group>
        ORDER ONLINE
        <template #items>
          <vs-navbar-item v-for="store in stores" :key="store.id" :active="activeStoreSlug == store.slug" :to="`/order/${store.slug}`">
            {{ store.name | capitalize }}
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
    
    <vs-navbar-item v-for="page in navPages" :key="page.slug" :active="active == page.slug" :to="'/p/' + page.slug">
      {{ page.name | uppercase }}
    </vs-navbar-item>

    <template #right>
      <template v-if="user">
        <vs-navbar-group>
          <span class="user-fullname">
            <i class="bx bxs-user"></i>
            {{ user.fullname || user.username }}
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
  props: {
    large: {
      type: Boolean,
      default: false
    },
    sticky: {
      type: Boolean,
      default: false
    }
  },
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
    ...mapState(['stores', 'pages']),
    user(){
      return this.$strapi.user;
    },
    active(){
      return this.$route.name;
    },
    activeStoreSlug(){
      return this.$route.params.store;
    },
    navPages(){
      return this.pages.filter(p => p.show_in_navigation_menu);
    }
  }
};
</script>

<style lang="scss" scoped>
.navbar{
  padding: 6px;
  &.large{
    padding: 12px;
  }
  &.sticky{
    position: sticky !important;
    top: 0;
  }
}
</style>

<style lang="scss">
.vs-navbar-content{
  position: relative !important;
  border-radius: 0 !important;
  box-shadow: 0 0 6px #e2e2e2;
  .user-fullname{
    min-width: 120px;
    display: inline-block;
  }
  .vs-button{
    margin-left: 6px;
  }
}
</style>