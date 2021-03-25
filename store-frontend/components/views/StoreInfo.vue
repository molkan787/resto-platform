<template>
    <div class="store-info">
        <h1>
            {{ storeName | capitalize }}
            <span class="status" :class="{ closed: !isOpen }">
                {{ statusText }}
            </span>
        </h1>
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
        }
    },
    computed: {
        ...mapState({
            enable_preorders: state => state.storeSettings.enable_preorders
        }),
        isOpen(){
            return isStoreOpen(this.store, new Date());
        },
        statusText(){
            if(this.isOpen){
                return 'CURRENTLY OPEN';
            }else if(this.enable_preorders){
                return 'CURRENTLY CLOSED (PRE ORDERS ONLY)';
            }else{
                return 'CURRENTLY CLOSED';
            }
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
    h1{
        color: rgba(var(--vs-primary), 1);
        .status{
            float: right;
            display: inline-block;
            font-size: 1.2rem;
            color: #545454;
            padding-left: .2rem;
            transform: translateY(5px);
            &.closed{
                color: #da5b5b;
            }
        }
    }
    p{
        white-space: pre-line;
    }
}
</style>