<template>
  <Card class="product">
    <template #title>
      {{ product.name }}
    </template>
    <template #content>
      {{ product.description }}
    </template>
    <template #footer>
      <span class="price">{{ product.price | price }}</span>
    </template>
  </Card>
</template>

<script>
export default {
  props: {
    product: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.product{
  cursor: pointer;
  box-shadow: none;
  &:hover{
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  }
}
</style>

<style lang="scss">
.product{
  .p-card-title{
    font-size: 17px !important;
    color: rgb(0, 0, 0);
    font-weight: normal;
  }
  .p-card-content{
    color: rgb(117, 117, 117);
  }
  .price{
    color: rgb(0, 0, 0)
  }
}
</style>