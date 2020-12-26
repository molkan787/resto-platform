<template>
  <Page class="order-page">
    <div class="content">
      <div class="left-column">
        <div class="categories-header">
          <vs-button-group>
            <vs-button v-for="cat in categories" :key="'tab-sel-' + cat.slug" flat
              @click="categoryNameClicked(cat)">
              {{ cat.name }}
            </vs-button>
          </vs-button-group>
        </div>
        <Category v-for="cat in categories" :key="cat.slug" :category="cat" />
      </div>
      <div class="right-column">
        <Cart />
      </div>
    </div>
  </Page>
</template>

<script>
export default {
  async asyncData(ctx){
    const categories = await ctx.$dataService.getCategories();
    return { categories };
  },
  data: () => ({
    currentCategoryIndex: 0,
    categories: []
  }),
  methods: {
    categoryNameClicked(category){
      const selector = `category-pane-${category.slug}`;
      document.getElementById(selector).scrollIntoView({ behavior: 'smooth' });
    }
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