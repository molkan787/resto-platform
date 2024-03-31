<template>
    <div class="vertical-tab-tree-item" :class="{ expanded, selected }">
        <div class="content" :class="classes" @click="$emit('click', { item: item, deepLevel: deepLevel })">
            {{ item.name }}
            <i v-if="selected" class='bx bx-chevron-right'></i>
        </div>
        <div class="children" v-if="expanded">
            <div class="sub-line"></div>
            <div class="items">
                <VerticalTabTreeItem
                    v-for="child in item.children" :key="child.id" :item="child"
                    :state="state" :deepLevel="deepLevel + 1"
                    @click="$emit('click', { item: child, deepLevel: deepLevel + 1 })"
                />
            </div>
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
    &:not(:last-child){
        border-bottom: 2px dashed rgb(230, 230, 230);
    }
    .content{
        padding: 10px 7px;
        cursor: pointer;
        user-select: none;
        font-size: 18px;
        border-radius: 0 6px 6px 0;
        transition: background-color 0.15s;
        &:hover{
            background-color: rgba(var(--vs-primary), 0.2);
        }
        &.bold{
            font-weight: bold;
        }
        &.selected{
            text-decoration: underline;
        }
        i{
            font-size: 23px;
            line-height: 0;
            transform: translateY(3px);
        }
    }
    .children{
        display: grid;
        margin: 4px 0 4px 0;
        padding-left: 0.4rem;
        grid-template-columns: 3px auto;
        .items{
            margin-left: 6px;
        }
        .sub-line{
            height: calc(100% - 40px);
            background-color: rgba(80,60,60, 0.5) !important;
            border-radius: 6px;
            margin: 20px 0;
        }
    }
}
</style>