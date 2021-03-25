<template>
    <div class="vertical-tab-tree">
        <VerticalTabTreeItem
            v-for="item in items" :key="item.id" :item="item"
            :state="state"
            @click="itemClick"
        />
    </div>
</template>

<script>
export default {
    props: {
        items: {
            type: Array,
            required: true
        }
    },
    data: () => ({
        state: {
            selected: null,
            expanded: null,
        }
    }),
    methods: {
        itemClick({ item, deepLevel }){
            this.state.selected = item;
            if(item.children.length){
                this.state.expanded = item;
            }else if(deepLevel == 0){
                this.state.expanded = null;
            }
            this.$emit('selected', item);
        }
    },
    mounted(){
        this.state.selected = this.items[0];
        this.$emit('selected', this.items[0]);
    }
}
</script>