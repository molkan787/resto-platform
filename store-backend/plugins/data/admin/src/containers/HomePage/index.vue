<template>
    <div class="data-page-index">
        <section class="card">
            <h3>Menu</h3>
            <button>Import</button>
            <button>Export</button>
        </section>
    </div>
</template>

<style scoped>
.data-page-index{
    padding: 2rem;
}
button{
    display: inline-block;
    height: 30px;
    width: fit-content;
    padding: 0 15px 2px;
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
.card{
    display: block !important;
    padding: 1rem;
    background: #ffffff;
    border-radius: 2px;
    box-shadow: 0 2px 4px #e3e9f3;
}
</style>