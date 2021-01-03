<template>
  <Page class="order-page">
    <div class="content">
      <div class="left-column">
        <h2>Order from {{ storeName | capitalize }}</h2>
        <CategoriesHeader :items="categories" />
        <Category v-for="cat in categories" :key="cat.slug" :category="cat" @productClick="productClick" />
        <ProductOptionsModal ref="productOptionsModal" />
      </div>
      <div class="right-column">
        <Cart />
      </div>
    </div>
  </Page>
</template>

<script>
import { mapState } from 'vuex';
export default {
  async asyncData(ctx){
    const categories = await ctx.$dataService.getCategories(ctx.params.store);
    return { categories };
  },
  computed: {
    ...mapState(['activeStore']),
    storeName(){
      const s = this.activeStore;
      return s && s.slug == this.$route.params.store ? s.name : '';
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
  },
  mounted(){
    this.$appService.setActiveStoreBySlug(this.$route.params.store);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/_vars";
.order-page .content{
  display: flex;
  flex-direction: row;
  .left-column{
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