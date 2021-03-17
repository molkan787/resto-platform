<template>
    <Page class="account-orders-page">
        <div class="page-container no-pad-mobile">
            <div class="table-wrapper">
                <h1 class="p-color">Orders History</h1>
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
                                {{ tr.no || "---" }}
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
        </div>
    </Page>
</template>

<script>
export default {
    async asyncData({ $strapi }) {
        const orders = await $strapi.find("orders", {
            _sort: "id:DESC",
            status_ne: 'pending'
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
    h1{
        margin-bottom: 1rem;
        @media only screen and (max-width: 768px) {
            padding: 1rem;
            margin-bottom: 0;
            text-align: center;
        }
    }
    .table-wrapper {
        padding: 4rem;
        @media only screen and (max-width: 768px) {
            padding: 0rem;
        }
    }
    .vs-table__tr {
        cursor: pointer;
    }
}
</style>