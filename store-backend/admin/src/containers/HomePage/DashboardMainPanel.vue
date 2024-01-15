<template>
    <div style="min-height: 350px;">
        <div style="height: 12px; width: 100px;"></div>
        <h1>Orders</h1>
        <table>
            <tbody>
                <tr>
                    <td class="mtd big-number">17</td>
                    <td class="mtd big-number">8</td>
                    <td class="mtd big-number">37</td>
                </tr>
                <tr>
                    <td class="mtd st-name">Pending</td>
                    <td class="mtd st-name">In preparation</td>
                    <td class="mtd st-name">Completed</td>
                </tr>
            </tbody>
        </table>
        <!-- <hr>
        <h3>Sales</h3>
        <table>
            <tbody>
                <tr>
                    <td class="mtd big-number-2">$2,437</td>
                    <td class="mtd big-number-2">$11,782</td>
                    <td class="mtd big-number-2">$56,231</td>
                </tr>
                <tr>
                    <td class="mtd st-name">Today</td>
                    <td class="mtd st-name">This week</td>
                    <td class="mtd st-name">This month</td>
                </tr>
            </tbody>
        </table>
        <hr> -->
    </div>
</template>

<script>
export default {
    data: () => ({
        
    })
}
</script>

<style scoped>
h1{
    margin-bottom: 22px;
}
.mtd{
    padding-right: 28px;
}
.big-number{
    color: #007bff;
    font-size: 42px;
}
.big-number-2{
    color: #007bff;
    font-size: 32px;
}
.st-name{
    padding-top: 12px;
    padding-left: 4px;
    font-size: 16px;
}
</style>