<template>
    <div class="footer">
        <div class="content">
            <div class="col">
                <nuxt-link to="/">HOME</nuxt-link>

                <template v-if="stores.length == 1">
                    <nuxt-link :to="`/order/${stores[0].slug}`">ORDER</nuxt-link>
                </template>
                <template v-else>
                    <nuxt-link v-for="store in stores" :key="store.slug" :to="'/order/' + store.slug">
                        ORDER ON {{ store.name | uppercase }}
                    </nuxt-link>
                </template>

                <template v-if="bookableStores.length == 1">
                    <nuxt-link :to="`/book/${bookableStores[0].slug}`">BOOK TABLE</nuxt-link>
                </template>
                <template v-else-if="bookableStores.length > 1">
                    <nuxt-link v-for="store in bookableStores" :key="store.slug" :to="'/book/' + store.slug">
                        BOOK TABLE IN {{ store.name | uppercase }}
                    </nuxt-link>
                </template>

                <nuxt-link to="/gallery">GALLERY</nuxt-link>

            </div>
            <div class="col">
                <nuxt-link v-for="page in pages" :key="page.slug" :to="'/p/' + page.slug">
                    {{ page.name | uppercase }}
                </nuxt-link>
            </div>
            <div class="col">
                Powered by <br>
                <a href="https://digitalfoodtechnology.com" target="_blank">Digital Food Technology</a>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
    computed: {
        ...mapState(['pages', 'stores']),
        bookableStores(){
            return this.stores.filter(s => s.enable_booking);
        }
    },

}
</script>

<style lang="scss" scoped>
.footer {
    padding: 2rem;
    width: 100%;
    background-color: rgba(var(--vs-primary), 0.1);
    border-bottom: 4px solid rgba(var(--vs-primary), 1);
    .content{
        max-width: 1000px;
        width: 100%;
        margin: auto;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        .col{
            display: flex;
            flex-direction: column;
            a{
                margin-bottom: 0.5rem;
            }
        }
    }
}
</style>