<template>
  <BasePage class="page">
    <Header />
    <slot></slot>
    <AuthModal />
  </BasePage>
</template>

<script>
import BasePage from '../base/BasePage';
export default {
  components: {
    BasePage
  }
}
</script>