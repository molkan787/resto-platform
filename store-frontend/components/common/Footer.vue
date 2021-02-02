<template>
    <div class="footer">
        <div class="content">
            <nuxt-link to="/">HOME</nuxt-link>

            <template v-if="stores.length == 1">
                <nuxt-link :to="`/order/${stores[0].slug}`">ORDER</nuxt-link>
            </template>
            <template v-else>
                <nuxt-link v-for="store in stores" :key="store.slug" :to="'/order/' + store.slug">
                    ORDER ON {{ store.name | uppercase }}
                </nuxt-link>
            </template>

            <nuxt-link to="/gallery">GALLERY</nuxt-link>

            <nuxt-link v-for="page in pages" :key="page.slug" :to="'/p/' + page.slug">
                {{ page.name | uppercase }}
            </nuxt-link>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
    computed: mapState(['pages', 'stores'])
}
</script>

<style lang="scss" scoped>
.footer {
    width: 100%;
    padding: 2rem;
    background-color: rgba(var(--vs-primary), 0.1);
    border-bottom: 4px solid rgba(var(--vs-primary), 1);
    .content {
        max-width: 1000px;
        width: 100%;
        margin: auto;
        display: grid;
        grid-template-columns: repeat(4, calc(100% / 4));
        gap: 10px;
        @media (max-width: 768px) {
            &{
                grid-template-columns: repeat(2, calc(100% / 2));
            }
        }
    }
}
</style>