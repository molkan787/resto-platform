<template>
    <div class="store-info">
        <div class="header">
            <template v-if="showOpenStatus">
                <vs-button class="status" :color="isOpen ? 'success' : 'danger'" :class="{closed: !isOpen}">
                    {{ isOpen ? 'OPEN' : 'CLOSED' }}
                </vs-button>
                <div class="preorder-text" v-if="enable_preorders">
                    PRE ORDERS ONLY
                </div>
            </template>
            <h1 v-else>{{ storeName | capitalize }}</h1>
        </div>
        <p>
        {{ address }}
        </p>
    </div>
</template>

<script>
import { isStoreOpen } from '~/store';
import { mapState } from 'vuex';
export default {
    props: {
        store: {
            type: Object,
            required: true
        },
        showOpenStatus: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        ...mapState({
            enable_preorders: state => state.storeSettings.enable_preorders
        }),
        isOpen(){
            return isStoreOpen(this.store, new Date());
        },
        storeName(){
            return this.store.name;
        },
        address(){
            const s = this.store || {};
            const { line1, line2, postcode, city } = s.address || {};
            const _postcode = (postcode || '').toUpperCase();
            return [line1, line2, _postcode, city].filter(i => !!i).join('\n');
        },
    }
}
</script>

<style lang="scss" scoped>
.store-info{
    padding: 1rem;
    .header{
        color: rgba(var(--vs-primary), 1);
        .status{
            display: inline-block;
            padding: 0 1rem;
            pointer-events: none;
            font-weight: bold;
            margin-left: -0.2rem;
            &.closed{
                background-color: #e86363 !important;
            }
        }
        .preorder-text{
            font-weight: bold;
            font-size: 0.8rem;
            color: rgb(58, 58, 58);
        }
    }
    p{
        white-space: pre-line;
    }
}
</style>