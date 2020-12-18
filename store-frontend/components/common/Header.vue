<template>
  <vs-navbar center-collapsed v-model="active">
    <template #left>
      <img src="/logo2.png" alt="" />
    </template>
    <vs-navbar-group>
      Docs
      <template #items>
        <vs-navbar-item :active="active == 'guide'" id="guide">
          Guide
        </vs-navbar-item>
        <vs-navbar-item :active="active == 'docs'" id="docs">
          Documents
        </vs-navbar-item>
        <vs-navbar-item :active="active == 'components'" id="components">
          Components
        </vs-navbar-item>
      </template>
    </vs-navbar-group>

    <vs-navbar-group>
      Ecosystem

      <template #items>
        <h5 class="title">Social</h5>

        <vs-navbar-item :active="active == 'Github'" id="Github">
          Github
        </vs-navbar-item>
        <vs-navbar-item :active="active == 'Discord'" id="Discord">
          Discord
        </vs-navbar-item>
        <vs-navbar-item :active="active == 'Twitter'" id="Twitter">
          Twitter
        </vs-navbar-item>
        <vs-navbar-item :active="active == 'Medium'" id="Medium">
          Medium
        </vs-navbar-item>
      </template>
    </vs-navbar-group>

    <vs-navbar-item :active="active == 'License'" id="License">
      License
    </vs-navbar-item>

    <template #right>
      <vs-button flat>Login</vs-button>
      <vs-button>Get Started</vs-button>
    </template>
  </vs-navbar>
</template>

<script>
export default {
  data: () => ({
    active: "guide",
  }),
};
</script>

<style lang="scss">
.vs-navbar-content{
    position: relative !important;
}
</style>