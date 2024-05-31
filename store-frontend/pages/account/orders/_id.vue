<template>
    <Page>
        <div class="content-wrapper">
            <div class="top-section">
                <h1 class="p-color">Order #: {{ order.no }}</h1>
                <div class="info">
                    <h3>Status: {{ order.status | capitalize }}</h3>
                    <h3>Type: {{ order.type | capitalize }}</h3>
                    <h3>Total: {{ order.total | price }}</h3>
                    <h3 class="created-date">Placed on: {{ order.createdAt | date }}</h3>
                    <h3>Note: {{ order.note || '---' }}</h3>
                </div>
                <h3>Items</h3>
            </div>
            <vs-table>
                <template #thead>
                    <vs-tr>
                        <vs-th> Name </vs-th>
                        <vs-th> Quantity </vs-th>
                        <vs-th> Unit Price </vs-th>
                    </vs-tr>
                </template>
                <template #tbody>
                    <vs-tr :key="i" v-for="(tr, i) in order.products" :data="tr">
                        <vs-td>
                            {{ tr.name }}
                            <template v-if="doesUseExtrasAsVariations(tr)" class="extras">
                                {{ extraName(tr) }}
                            </template>
                            <div v-else class="extras">
                                <div v-for="(e, index) in tr.extras" :key="e.name + index">
                                    + {{ e.name }}
                                </div>
                            </div>
                        </vs-td>
                        <vs-td>
                            {{ tr.pid == 'discount' ? '-' : tr.quantity }}
                        </vs-td>
                        <vs-td>
                            {{ tr.unit_price | price_ft }}
                        </vs-td>
                    </vs-tr>
                </template>
            </vs-table>
        </div>
    </Page>
</template>

<script>
export default {
    async asyncData(context) {
        const { id } = context.params;
        const order = await context.$strapi.findOne("orders", id);
        return {
            id,
            order,
        };
    },
    methods: {
        doesUseExtrasAsVariations(product){
            return product.extras.findIndex(e => e.name === 'use_extras_as_variations') >= 0
        },
        extraName(product){
            return product.extras
                .filter(e => e.name !== 'use_extras_as_variations')
                .map(e => e.name).join(' ')
        }
    },
    mounted() {
        console.log(this.order);
    },
};
</script>

<style lang="scss" scoped>
.content-wrapper {
    padding: 4rem;
    @media only screen and (max-width: 768px) {
        padding: 0rem;
    }
    .top-section{
        h1{
            font-size: 2rem;
        }
        h3{
            font-size: 1rem;
        }
        padding: 1rem;
    }
}
.info{
    display: grid;
    width: 100%;
    color: rgb(39, 39, 39);
    grid-template-columns: repeat(3, calc(100% / 3));
    @media only screen and (max-width: 768px) {
        grid-template-columns: repeat(2, calc(100% / 2));
    }
    .created-date{
        grid-column: span 2;
    }
}
.extras{
    padding-left: 1rem;
}
</style>