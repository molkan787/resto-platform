<template>
    <div class="store-info">
        <h1>{{ $store.state.appName }} - {{ storeName | capitalize }}</h1>
        <p>
        {{ address }}
        </p>
    </div>
</template>

<script>
export default {
    props: {
        store: {
            type: Object,
            required: true
        }
    },
    computed: {
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
    }
    p{
      white-space: pre-line;
    }
}
</style>