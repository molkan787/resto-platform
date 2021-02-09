<template>
    <div class="products-options-form h-form">
        <div class="field">
            <label>Remarks</label>
            <textarea v-model="note" placeholder="Remarks"></textarea>
        </div>
        <div v-if="product.extras.length" class="field">
            <label>Choice of extras</label>
            <div class="extras">
                <vs-checkbox v-for="extra of product.extras" :key="extra.id" :val="extra" v-model="extras">
                    {{ extra.name }} (+{{ extra.price | price }})
                </vs-checkbox>
            </div>
        </div>
        <vs-alert v-if="stockLimit" color="warn">
            Only <b>{{ stockLimit }}</b>
            {{ stockLimit == 1 ? 'item is' : 'items are'}}
            left in stock.
        </vs-alert>
        <div class="field final">
            <div class="controls">
                <vs-button @click="addQty(-1)" flat>
                    <i class='bx bx-minus'></i>
                </vs-button>
                <span class="qty">{{ qty }}</span>
                <vs-button @click="addQty(1)" flat>
                    <i class='bx bx-plus'></i>
                </vs-button>
            </div>
            <div class="total">
                {{ total | price }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        product: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        extras: [],
        qty: 1,
        note: '',
        stockLimit: null,
    }),
    computed: {
        unitPrice(){
            const extrasCost = this.extras.reduce((t, e) => t + e.price, 0);
            return this.product.price + extrasCost;
        },
        total(){
            return this.unitPrice * this.qty;
        }
    },
    methods: {
        addQty(amt){
            const { stock, enable_stock } = this.product;
            let newQty = this.qty + amt;
            if(newQty < 1){
                newQty = 1;
            }else if(enable_stock && newQty > stock){
                newQty = stock;
                this.stockLimit = stock;
            }else{
                this.stockLimit = null;
            }
            this.qty = newQty;
        },
        setOptions(options){
            const { extras, qty, note } = options || {};
            this.extras = extras || [];
            this.qty = qty || 1;
            this.note = note || '';
        }
    }
}
</script>

<style lang="scss" scoped>
.extras{
    padding: 0.5rem;
    font-size: 18px;
}
.final{
    display: flex;
    flex-direction: row;
    padding: 0.5rem;
    .controls{
        width: 100px;
        display: flex;
        flex-direction: row;
        .qty{
            flex: 1;
            font-size: 20px;
            display: inline-block;
            box-sizing: border-box;
            padding: 0.5rem;
            text-align: center;
        }
    }
    .total{
        flex: 1;
        display: inline-block;
        box-sizing: border-box;
        font-size: 20px;
        padding: 0.5rem;
        text-align: center;
    }
}
</style>