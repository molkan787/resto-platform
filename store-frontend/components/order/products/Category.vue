<template>
  <div class="category" :id="'category-pane-' + category.slug">
      <h2 class="header">{{ category.name }}</h2>
      <div class="content">
        <Product v-for="p in category.products" :key="p.id" :product="p" />
      </div>
  </div>
</template>

<script>
export default {
  props: {
    category: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/_vars";
.category{
  margin-bottom: 2rem;
  .header{
    margin-bottom: 1rem;
    padding-left: 15px;
  }
  .content{
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, calc((100% - 1rem) / 2));
    grid-gap: 1rem;
    @media (max-width: $mobile-width) {
      &{
        grid-template-columns: 100%;
      }
      .product{
        margin-left: 0;
        margin-right: 0;
      }
    }
  }
}
</style>

<style lang="scss">
.category .p-card-title{
  color: rgb(0, 0, 0);
}
</style>