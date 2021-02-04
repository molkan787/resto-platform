<template>
  <BasePage class="page" :style="style">
    <div class="page-struct">
      <Header v-bind="header" />
      <div class="page-content">
        <slot></slot>
      </div>
    </div>
    <AuthModal />
    <transition name="fade">
      <div @click="scrollToTop" v-if="showScrollToTop" class="to-top-wrapper vs-card">
        <i class='bx bxs-up-arrow'></i>
      </div>
    </transition>
    <Footer v-if="!noFooter" />
  </BasePage>
</template>

<script>
import BasePage from '../base/BasePage';
export default {
  components: {
    BasePage
  },
  props: {
    background: {
      type: String,
      default: null,
    },
    header: {
      type: Object,
      default: () => ({})
    },
    noFooter: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    style(){
      return this.background ? `background-image: url('${this.background}');` : '';
    }
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
.page{
  width: 100%;
  height: 100vh;
  background-repeat: no-repeat;
  background-size: cover;
  .page-struct{
    height: auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    .page-content{
      height: auto;
      min-height: calc(100vh - 68px);
      flex: 1;
    }
  }
}
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
  cursor: pointer;
  &:hover{
    transform: translateY(-10px);
    color: rgb(100, 112, 117);
  }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>