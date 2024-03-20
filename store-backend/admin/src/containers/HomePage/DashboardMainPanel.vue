<template>
    <div style="min-height: 350px;">
        <div style="height: 12px; width: 100px;"></div>
        <h1>Complete your setup</h1>
        <ul>
            <li>
                <h3>1. Setup Payment</h3>
                <p>
                    Connect your bank account to our Stripe account to receive your online revenue.
                    <br>
                    <button @click="goTo('/admin/plugins/stripe-connect')" class="gsb">Get Started</button>
                </p>
            </li>
            <li>
                <h3>2. Setup POS App</h3>
                <p>
                    Download and link POS Desktop application to receive and manager your online & in-store orders.
                    <br>
                    <button @click="goTo('/admin/plugins/pos-sync')" class="gsb">Get Started</button>
                </p>
            </li>
            <li>
                <h3>3. Generate Mobile App</h3>
                <p>
                    Generate your own mobile application for both Android & iOS with just one click.
                    <br>
                    <button @click="goTo('/admin/plugins/mobile-app')" class="gsb">Get Started</button>
                </p>
            </li>
            <li>
                <h3>4. Populate Restaurant Menu</h3>
                <p>
                    After linking POS you can start populating your food menu from within the POS App to display it in the website and mobile app for your customer to order.
                </p>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    data: () => ({
        
    }),
    methods: {
        goTo(path){
            window.location.replace(path)
        }
    }
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
.gsb{
    margin-top: 0.5rem;
}
button, .button{
    display: inline-block;
    position: relative;
    height: 3.4rem;
    width: fit-content;
    padding: 3px 15px 2px;
    font-weight: 600;
    font-size: 1.3rem;
    line-height: normal;
    border-radius: 2px;
    cursor: pointer;
    outline: 0;
    background-color: #007EFF;
    border: 1px solid #007EFF;
    color: #ffffff;
}
li{
    margin-bottom: 2rem;
}
</style>