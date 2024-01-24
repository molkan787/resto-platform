<template>
  <Page :background="background_image" :header="{ large: true, sticky: true }" :noFooter="true">
    <div class="home-page">
      <section class="welcome" v-rellax="{speed: 2}">
        <div class="container center-content">
          <h1 class="hd1">{{ header }}</h1>
          <h1 class="hd2">{{ subheader }}</h1>
          <p class="bp1">{{ text }}</p>
          <div class="menu-buttons">
            <template v-if="stores.length > 1">
              <vs-button v-for="store in stores" :key="store.id" size="xl" :to="`/order/${store.slug}`">
                Order from {{ store.name | capitalize }}
              </vs-button>
            </template>
            <template v-else>
              <vs-button size="xl" :to="`/order/${(stores[0] || {}).slug}`">
                ORDER ONLINE
              </vs-button>
            </template>
          </div>
          <p class="menu-buttons">
            <a v-for="btn in menuButtons" :key="btn.id" :href="btn.url" target="_blank">
              <vs-button border size="large">
                {{ btn.name }}
              </vs-button>
            </a>
          </p>
        </div>
      </section>
      <section v-rellax="{speed: 10}">

        <div v-for="(block, index) in content_sections" :key="block.id" class="container center-content">
          <div class="content-block">
            <div class="imgs-wrapper" v-if="index % 2 == 0 && !isMobile">
              <img v-for="img in block.images" :key="img.id" :src="imgUrl(img)" :alt="img.alternativeText">
            </div>
            <div class="fluid center-content text">
              <h1>{{ block.title | uppercase }}</h1>
              <div v-html="block.content" />
            </div>
            <div class="imgs-wrapper" v-if="index % 2 == 1 || isMobile">
              <img v-for="img in block.images" :key="img.id" :src="imgUrl(img)" :alt="img.alternativeText">
            </div>
          </div>
        </div>

      </section>
      <section class="footer-section">
        <div class="footer-wrapper">
          <Footer />
        </div>
      </section>
    </div>
  </Page>
</template>

<script>
import { mapState } from 'vuex';
export default {
  computed: {
    ...mapState(['stores']),
    menuButtons(){
      const stores = this.stores.filter(s => !!s.menu_file);
      return stores.map(({ id, name, menu_file }) => {
        const _name = stores.length == 1 ? 'Menu' : `${name} Menu`;
        return {
          id: id,
          name: _name,
          url: `/mir?u=${encodeURIComponent(menu_file.url)}&title=${_name}`
        }
      })
    }
  },
  async asyncData({ $strapi }){
    const { prefixUrl } = $strapi.$http._defaults;
    const data = await $strapi.find('home-page-settings');
    const {
      landing_header,
      landing_subheader,
      landing_text,
      background_image,
      content_sections
    } = data;
    return {
      header: landing_header,
      subheader: landing_subheader,
      text: landing_text,
      background_image: `${prefixUrl}${background_image.url}`,
      content_sections,
      prefixUrl
    }
  },
  methods: {
    imgUrl(img){
      return `${this.prefixUrl}${img.url}`;
    }
  }
}
</script>

<style lang="scss" scoped>
.home-page{
  height: 100%;
  .welcome{
    height: fit-content;
    color: white;
    .container{
      height: calc(100vh - 60px);
    }
    .hd1{
      font-size: 46px;
    }
    .hd2{
      font-size: 32px;
      margin-bottom: 1.5rem;
    }
    .bp1{
      font-size: 20px;
      max-width: 500px;
      @media only screen and (max-width: 768px){
        max-width: none;
        width: 100%;
        padding: 1rem;
      }
    }
    filter: blur(0.45px);
    text-shadow: 0 0 2px #3e3e3e;
  }
  section:not(:first-child):not(.footer-section){
    background-color: white;
    padding: 3rem;
    @media only screen and (max-width: 768px){
      padding: 1.2rem;
    }
  }
  section.footer-section{
    margin-top: -16rem;
    .footer-wrapper{
      background-color: white;
    }
  }
  .content-block{
    margin-bottom: 3rem;
    h1{
      font-size: 42px;
      color: rgba(var(--vs-primary), 1);
    }
    img{
      height: 420px;
    }
    @media only screen and (max-width: 768px) {
      flex-wrap: wrap;
      .text, .imgs-wrapper{
        width: 100%;
      }
      .imgs-wrapper{
        display: flex;
        flex-direction: row;
        overflow-y: scroll;
        img{
          height: auto;
          padding: 0.2rem;
        }
      }
    }
  }
  .menu-buttons{
    padding-top: 1rem;
    display: flex;
    flex-direction: row;
    & > button{
      margin: 0 10px;
    }
  }
}
</style>

<style>
.title {
  font-family:
    'Quicksand',
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
