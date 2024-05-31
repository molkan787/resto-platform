<template>
    <div class="products-options-form h-form">
        <div class="field">
            <label>Remarks</label>
            <textarea v-model="note" placeholder="Remarks"></textarea>
        </div>
        <template v-if="product.extras.length">
            <div v-if="useExtrasAsVariations" class="field">
                <label>Choose variation</label>
                <div class="extras">
                    <vs-radio v-for="extra of product.extras.filter(e => e.name !== 'use_extras_as_variations')" :key="extra.id" :val="extra" v-model="variationExtras">
                        {{ product.name + ' ' + extra.name }} ({{ extra.price | price }})
                    </vs-radio>
                </div>
            </div>
            <div v-else class="field">
                <label>Choice of extras</label>
                <div class="extras">
                    <vs-checkbox v-for="extra of product.extras" :key="extra.id" :val="extra" v-model="extras">
                        {{ extra.name }} (+{{ extra.price | price }})
                    </vs-checkbox>
                </div>
            </div>
        </template>
        
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
    watch: {
        variationExtras(value){
            this.extras = this.extras.filter(v => v.name === 'use_extras_as_variations')
            this.extras.push(value)
        }
    },
    data: () => ({
        extras: [],
        variationExtras: null,
        qty: 1,
        note: '',
        stockLimit: null,
    }),
    computed: {
        unitPrice(){
            if(this.useExtrasAsVariations){
                return this.product.price + (this.variationExtras ? this.variationExtras.price : 0)
            }
            const extrasCost = this.extras.reduce((t, e) => t + e.price, 0);
            return this.product.price + extrasCost;
        },
        total(){
            return this.unitPrice * this.qty;
        },
        useExtrasAsVariations(){
            return this.product.extras.findIndex(e => e.name === 'use_extras_as_variations') >= 0
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

            if(this.useExtrasAsVariations){
                const varExtra = this.extras.filter(e => e.name !== 'use_extras_as_variations')[0]
                if(varExtra){
                    this.variationExtras = this.product.extras.find(e => e.id === varExtra.id)
                }else{
                    this.extras = []
                    for(let v of this.product.extras){
                        if(v.name === 'use_extras_as_variations'){
                            this.extras.push(v)
                        }else{
                            this.variationExtras = v
                            this.extras.push(v)
                            break
                        }
                    }
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.extras{
    padding: 0.5rem;
    font-size: 18px;
    text-align: left;
    .vs-radio-content{
        justify-content: start;
        margin-bottom: 0.5rem
    }
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