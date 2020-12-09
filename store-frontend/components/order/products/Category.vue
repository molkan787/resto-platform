<template>
  <Card class="category">
    <template #title>
      {{ category.name }}
    </template>
    <template #content>
      <div class="content">
        <Product v-for="p in category.products" :key="p.id" :product="p" />
      </div>
    </template>
  </Card>
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
.category{
  .content{
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, calc((100% - 1rem) / 2));
    grid-gap: 1rem;
    .product{
      margin-left: -16px;
      margin-right: 16px;
    }
  }
}
</style>

<style lang="scss">
.category .p-card-title{
  color: rgb(0, 0, 0);
  // font-weight: normal;
}
</style>