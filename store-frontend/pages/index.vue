<template>
  <Page :background="require('~/assets/images/landing_page_bg.jpg')" :header="{ large: true, sticky: true }" :noFooter="true">
    <div class="home-page">
      <section class="welcome" v-rellax="{speed: 2}">
        <div class="container center-content">
          <h1 class="hd1">Chocolate</h1>
          <h1 class="hd2">Murew</h1>
          <p class="bp1">
            Donec mattis sapien vel sagittis dictum. Nulla ut diam egestas, consequat massa eget,
            porta enim. Vivamus vitae libero eget justo venenatis pellentesque in vel odio.
          </p>
        </div>
      </section>
      <section v-rellax="{speed: 10}">
        <div class="container center-content">
          <div class="content-block">
            <div class="fluid center-content">
              <h1>MODERNITY</h1>
              <p>
                The Mint Room have built a reputation of providing dishes which are daringly different,
                high-end, with first-rate British ingredients brought to an enticing level of Indian flair.
                Emphasizing the luxurious combinations of flavours with a great sense of innovation that
                draws upon both traditional and modern Indian cuisine.
              </p>
            </div>
            <img src="~/assets/images/dish-1.png" alt="">
            <img src="~/assets/images/dish-2.png" alt="">
          </div>
        </div>
        <div class="container center-content">
          <div class="content-block">
            <img src="~/assets/images/dish-2.png" alt="">
            <img src="~/assets/images/dish-1.png" alt="">
            <div class="fluid center-content">
              <h1>MODERNITY</h1>
              <p>
                The Mint Room have built a reputation of providing dishes which are daringly different,
                high-end, with first-rate British ingredients brought to an enticing level of Indian flair.
                Emphasizing the luxurious combinations of flavours with a great sense of innovation that
                draws upon both traditional and modern Indian cuisine.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section class="footer-section" v-rellax="{speed: 10}">
        <div class="footer-wrapper">
          <Footer />
        </div>
      </section>
    </div>
  </Page>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({})
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
    }
    filter: blur(0.45px);
    text-shadow: 0 0 2px #3e3e3e;
  }
  section:not(:first-child):not(.footer-section){
    background-color: white;
    padding: 3rem;
  }
  section.footer-section{
    padding-top: 18rem;
    .footer-wrapper{
      background-color: white;
    }
  }
  .content-block{
    h1{
      font-size: 42px;
      color: rgba(var(--vs-primary), 1);
    }
    img{
      height: 420px;
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
