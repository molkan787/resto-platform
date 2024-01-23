<template>
  <div class="category" :id="'category-pane-' + category.slug">
      <div class="header">
        <vs-card class="category-header-card" @click="headerCardClick">
          <template #text>
            <h2>
              {{ category.name }}
              <i class="bx" :class="expanded ? 'bxs-down-arrow' : 'bxs-up-arrow'"></i>
            </h2>
            <div class="childs-tabs hide-scrollbar" v-if="expanded && category.children.length">
              <div class="items" cancel-toggle>
                <div @click="active = null" :class="{ active: active === null }" cancel-toggle>
                  All
                </div>
                <div v-for="child in category.children" :key="child.id"
                  @click="active = child.id ? child : null"
                  :class="{ active: active && active.id === child.id }"
                  cancel-toggle>
                  {{ child.name }}
                </div>
              </div>
            </div>
          </template>
        </vs-card>
      </div>
      <div v-if="expanded" class="content">
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
    expanded: false,
  }),
  computed: {
    products(){
      return this.active ? this.active.products : this.allProducts;
    },
    children(){
      return this.category.children.reduce((m, c) => (m[c.id] = c) && m, {});
    },
    allProducts(){
      const all = [...this.category.products]
      for(let n = 0; n < this.category.children.length; n++){
        all.push(...this.category.children[n].products)
      }
      return all
    }
  },
  methods: {
    headerCardClick(event){
      if(event.srcElement.getAttribute('cancel-toggle') === null){
        this.expanded = !this.expanded;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/_vars";
.category{
  .header{
    display: flex;
    flex-direction: row;
    h2{
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
          padding: 0 6px;
          cursor: pointer;
          opacity: 0.8;
          &.active{
            font-weight: bold;
            opacity: 1;
          }
        }
      }
    }
  }
  .content{
    width: 100%;
    margin-bottom: 1.5rem;
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
.category{
  .p-card-title{
    color: rgb(0, 0, 0);
  }
  .category-header-card{
    width: 100%;
    .vs-card{
      max-width: none;
      margin-bottom: 1rem;
      // background-color: rgba(var(--vs-primary), 0.1);
      // color: rgba(var(--vs-primary), 1);
      background-color: #f3f3f3;
      cursor: pointer;
      .vs-card__text{
        padding: 0;
        line-height: 3;
      }
    }
    i{
      float: right;
      margin: 1.2rem;
    }
  }
}
</style>