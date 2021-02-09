<template>
    <Page>
        <div class="content-wrapper">
            <h1>Order #: {{ order.no }}</h1>
            <div class="info">
                <h3>Status: {{ order.status | capitalize }}</h3>
                <h3>Type: {{ order.type | capitalize }}</h3>
                <h3>Total: {{ order.total | price }}</h3>
                <h3>Placed on: {{ order.createdAt | date }}</h3>
                <h3>Note: {{ order.note || '---' }}</h3>
            </div>
            <h3>Items</h3>
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
                            <div class="extras">
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
    mounted() {
        console.log(this.order);
    },
};
</script>

<style lang="scss" scoped>
.content-wrapper {
    padding: 4rem;
}
.info{
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, calc(100% / 3));
}
.extras{
    padding-left: 1rem;
}
</style>