<template>
  <div @click="addToCart" class="product">
    <vs-card class="hh-shadow">
      <template #title>
        <h2>
          {{ product.name }}
          <div class="head-right-section">
            <AllergyIcon v-if="product.contains_allergens" />
          </div>
        </h2>
      </template>
      <template #text>
        <p class="description">
          {{ product.description }}
        </p>
        <div class="bottom-row">
          <span class="price">
            {{ priceText }}
            <label v-if="outofstock" class="outofstock">Out of stock</label>
          </span>
          <div class="filler"></div>
          <vs-button flat>Add to cart</vs-button>
        </div>
        <!-- <div class="img-wrapper">
          <img src="~/assets/images/dish_placeholder_picture.jpg" alt="Dishes">
        </div> -->
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
    },
    useExtrasAsVariations(){
        return this.product.extras.findIndex(e => e.name === 'use_extras_as_variations') >= 0
    },
    priceText(){
      const p = v => this.$options.filters.price(v)
      if(this.useExtrasAsVariations){
        const prices = this.product.extras.map(e => e.price).filter(v => v > 0)
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        return `${p(min)} - ${p(max)}`
      }else{
        return p(this.product.price)
      }
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
  .head-right-section{
    display: inline-block;
    float: right;
  }
}
.bottom-row{
  display: flex;
  flex-direction: row;
  align-items: center;
  .filler{
    flex: 1;
  }
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
  .img-wrapper{
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    padding: 2px;
    max-height: 83px;
    img{
      height: 100%;
      border-radius: 4px;
      opacity: 0.4;
    }
  }
  // .vs-card__title{
  //   padding-left: 73px;
  // }
  
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
    // padding-left: 76px;
  }
  .price {
    color: rgb(0, 0, 0);
    // padding-left: 76px;
  }
  .outofstock{
    color: rgb(255, 71, 87);
    padding-left: 0.6rem;
    // float: right;
  }
}
.product{
  .vs-button{
    margin: 0 !important;
  }
}
</style>