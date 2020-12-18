<template>
  <div @click="addToCart" class="product">
    <vs-card>
      <template #title>
        <h2>
          {{ product.name }}
        </h2>
      </template>
      <template #text>
        <p>
          {{ product.description }}
        </p>
        <span class="price">{{ product.price | price }}</span>
      </template>
    </vs-card>
  </div>
</template>

<script>
export default {
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  methods: {
    addToCart() {
      this.$cartService.adjustProductQuantity(this.product.id, 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.product {
  cursor: pointer;
  box-shadow: none;
}
</style>

<style lang="scss">
.product {
  user-select: none;
  .vs-card, .vs-card-content{
    max-width: unset;
    height: 100%;
  }
  .p-card-title {
    font-size: 17px !important;
    color: rgb(0, 0, 0);
    font-weight: normal;
  }
  .p-card-content {
    color: rgb(117, 117, 117);
  }
  .price {
    color: rgb(0, 0, 0);
  }
}
</style>