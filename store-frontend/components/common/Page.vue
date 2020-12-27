<template>
  <BasePage class="page">
    <Header />
    <slot></slot>
    <AuthModal />
    <transition name="fade">
      <div @click="scrollToTop" v-if="showScrollToTop" class="to-top-wrapper vs-card">
        <i class='bx bxs-up-arrow'></i>
      </div>
    </transition>
  </BasePage>
</template>

<script>
import BasePage from '../base/BasePage';
export default {
  components: {
    BasePage
  },
  data: () => ({
    showScrollToTop: false,
  }),
  methods: {
    scrollToTop(){
      window.top.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    onScroll(){
      const s = window.top.scrollY;
      this.showScrollToTop = s > 100;
    }
  },
  mounted(){
    window.addEventListener('scroll', this.onScroll);
  },
  beforeDestroy(){
    window.removeEventListener('scroll', this.onScroll);
  }
}
</script>

<style lang="scss" scoped>
.to-top-wrapper{
  $w: 50px;
  position: fixed;
  width: $w;
  height: $w;
  right: 30px;
  bottom: 30px;
  padding: 15px;
  font-size: 20px;
  color: #98a5aa;
  &:hover{
    transform: translateY(-10px);
    color: rgb(100, 112, 117);
  }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>