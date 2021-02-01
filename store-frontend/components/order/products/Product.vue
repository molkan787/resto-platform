<template>
  <div @click="addToCart" class="product">
    <vs-card class="low-shadow hh-shadow">
      <template #title>
        <h2>
          {{ product.name }}
        </h2>
      </template>
      <template #text>
        <p class="description">
          {{ product.description }}
        </p>
        <span class="price">
          {{ product.price | price }}
          <label v-if="outofstock" class="outofstock">Out of stock</label>
        </span>
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
  computed: {
    outofstock(){
      return this.product.enable_stock && this.product.stock < 1;
    }
  },
  methods: {
    addToCart() {
      if(this.outofstock) return;
      // this.$cartService.adjustProductQuantity(this.product.id, 1);
      this.$emit('click', this.product);
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
  cursor: pointer;
  .vs-card, .vs-card-content{
    max-width: unset;
    height: 100%;
    cursor: pointer;
  }
  .p-card-title {
    font-size: 17px !important;
    color: rgb(0, 0, 0);
    font-weight: normal;
  }
  .p-card-content {
    color: rgb(117, 117, 117);
  }
  .description{
    padding-bottom: 1rem;
  }
  .price {
    color: rgb(0, 0, 0);
  }
  .outofstock{
    color: rgb(255, 71, 87);
    padding-left: 0.6rem;
    // float: right;
  }
}
</style>