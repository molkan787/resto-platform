<template>
    <div class="vertical-tab-tree-item" :class="{ expanded, selected }">
        <div class="content" :class="classes" @click="$emit('click', { item: item, deepLevel: deepLevel })">
            {{ item.name }}
        </div>
        <div class="children" v-if="expanded">
            <VerticalTabTreeItem
                v-for="child in item.children" :key="child.id" :item="child"
                :state="state" :deepLevel="deepLevel + 1"
                @click="$emit('click', { item: child, deepLevel: deepLevel + 1 })"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: 'VerticalTabTreeItem',
    props: {
        state: {
            type: Object,
            required: true
        },
        item: {
            type: Object,
            required: true
        },
        deepLevel: {
            type: Number,
            default: 0
        },
    },
    computed: {
        expanded(){
            return this.state.expanded == this.item;
        },
        selected(){
            return this.state.selected == this.item;
        },
        classes(){
            return {
                bold: this.deepLevel == 0,
                selected: this.selected,
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.vertical-tab-tree-item{
    border-top: 1px solid rgb(230, 230, 230);
    &:first-child, &.selected, &.selected + &, &.expanded + &{
        border-color: white;
    }
    .content{
        padding: 10px;
        cursor: pointer;
        user-select: none;
        font-size: 18px;
        border-radius: 0 12px 12px 0;
        transition: background-color 0.15s;
        &:hover{
            background-color: rgba(var(--vs-primary), 0.2);
        }
        &.bold{
            font-weight: bold;
        }
        &.selected{
            background-color: rgba(var(--vs-primary), 0.3);
            text-decoration: underline;
        }
    }
    .children{
        margin: 4px 0;
        padding-left: 1rem;
        border-left: 4px solid rgba(var(--vs-primary), 1);
    }
}
</style>