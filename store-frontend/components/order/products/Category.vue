<template>
  <div class="category" :id="'category-pane-' + category.slug">
      <div class="header">
        <h2>
          {{ activeName }}
        </h2>
        <div class="childs-tabs hide-scrollbar" v-if="childsItems.length">
          <div class="items">
            <div v-for="child in childsItems" :key="child.id" @click="active = child.id ? child : null">
              {{ child.name }}
            </div>
          </div>
        </div>
      </div>
      <div class="content">
        <Product v-for="p in products" :key="p.id" :product="p" @click="$emit('productClick', $event)" />
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
  },
  data: () => ({
    active: null,
  }),
  computed: {
    activeName(){
      return this.active ? this.active.name : this.category.name;
    },
    products(){
      return this.active ? this.active.products : this.category.products;
    },
    children(){
      return this.category.children.reduce((m, c) => (m[c.id] = c) && m, {});
    },
    childsItems(){
      const items = this.category.children.filter(c => c !== this.active);
      if(this.active != null){
        items.unshift({
          id: null,
          name: this.category.name
        });
      }
      return items;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/_vars";
.category{
  margin-bottom: 2rem;
  .header{
    display: flex;
    flex-direction: row;
    h2{
      margin-bottom: 1rem;
      padding-left: 15px;
    }
    .childs-tabs{
      flex: 1;
      overflow-x: scroll;
      overflow-y: hidden;
      & > .items{
        display: flex;
        flex-direction: row;
        padding-left: 6px;
        & > div{
          font-size: 17px;
          padding: 6px;
          cursor: pointer;
        }
      }
    }
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