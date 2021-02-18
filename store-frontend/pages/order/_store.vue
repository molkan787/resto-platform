<template>
  <Page class="order-page" :title="title">
    <div class="content">
      <div class="left-column">
        <StoreInfo :store="activeStore" />
        
        <OrderStackLayout v-if="layoutSettings.order_page_layout == 'stack' || isMobile" :categories="categories" @productClick="productClick" />
        <OrderTabsLayout v-else :categories="categories" @productClick="productClick" />

      </div>
      <div v-if="!isMobile" class="right-column">
        <Cart />
      </div>
    </div>
    <ProductOptionsModal ref="productOptionsModal" />
    <FloatingCart v-if="isMobile" />
  </Page>
</template>

<script>
import { mapState } from 'vuex';
// import FAB from ''
export default {
  async asyncData(ctx){
    ctx.$appService.setActiveStoreBySlug(ctx.params.store);
    const { categories } = await ctx.$dataService.getStoreMenu(ctx.params.store);
    return { categories };
  },
  computed: {
    ...mapState(['activeStore', 'layoutSettings', 'appName']),
    title(){
      return `Order online from ${(this.activeStore || {}).name || this.appName}`;
    }
  },
  data: () => ({
    currentCategoryIndex: 0,
    categories: []
  }),
  methods: {
    productClick(product){
      this.$refs.productOptionsModal.open(product);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/_vars";
.order-page .content{
  display: flex;
  flex-direction: row;
  max-width: 1300px;
  margin: auto;
  .left-column{
    min-width: 0;
    flex: 1;
  }
  .left-column, .right-column{
    padding: 1rem;
  }
  @media (max-width: $mobile-width){
    flex-direction: column;
  }
  .categories-header{
    background-color: white;
    position: sticky;
    top: 0;
    z-index: 1;
  }
}
</style>