<template>
    <Page class="account-orders-page">
        <div class="table-wrapper">
            <h1>My Orders</h1>
            <vs-table>
                <template #thead>
                    <vs-tr>
                        <vs-th> Order # </vs-th>
                        <vs-th> Order date </vs-th>
                        <vs-th> Status </vs-th>
                        <vs-th> Total </vs-th>
                    </vs-tr>
                </template>
                <template #tbody>
                    <vs-tr
                        :key="i"
                        v-for="(tr, i) in orders"
                        :data="tr"
                        @click="openOrder(tr)"
                    >
                        <vs-td>
                            {{ tr.no || '---' }}
                        </vs-td>
                        <vs-td>
                            {{ tr.createdAt | date }}
                        </vs-td>
                        <vs-td>
                            {{ tr.status | capitalize }}
                        </vs-td>
                        <vs-td>
                            {{ tr.total | price }}
                        </vs-td>
                    </vs-tr>
                </template>
            </vs-table>
        </div>
    </Page>
</template>

<script>
export default {
    async asyncData({ $strapi }) {
        const orders = await $strapi.find("orders", {
            _sort: "id:DESC",
        });
        return {
            orders,
        };
    },
    methods: {
        openOrder(order) {
            const { id } = order;
            this.$router.push(`/account/orders/${id}`);
        },
    },
};
</script>

<style lang="scss">
.account-orders-page {
    .table-wrapper{
        padding: 4rem;
    }
    .vs-table__tr {
        cursor: pointer;
    }
}
</style>