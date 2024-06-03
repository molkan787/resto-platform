const axios = require('axios')

async function setupAxios(){
    axios.defaults.baseURL = 'https://backend.laapsiindian.co.uk/'
    const { data: { jwt } } = await axios.post(
        'auth/local',
        {
            identifier: "dev@dft.com",
            password: "123456dft+++"
        }
    )
    axios.defaults.headers.common.Authorization = `Bearer ${jwt}`
}

async function spread(categoryId, sampleProductId){
    await setupAxios()

    const { data: samplePoduct } = await axios.get(`products/${sampleProductId}`)
    const extras = samplePoduct.extras.map(({ name, price }) => ({ name, price }))
    
    
    const { data: products } = await axios.get(`products?category=${categoryId}`)
    for(let p of products){
        await axios.put(`products/${p.id}`, { extras: extras })
    }
}

async function setFlag(categoryId){
    await setupAxios()
    const { data: products } = await axios.get(`products?category=${categoryId}`)
    for(let p of products){
        await axios.put(`products/${p.id}`,
            {
                extras: [
                    ...p.extras,
                    {
                        name: 'use_extras_as_variations',
                        price: 0
                    }
                ]
            }
        )
    }
}

async function createProducts(categoryId, items, extras){
    await setupAxios()
    
    for(let item of items){
        const { data } = await axios.post(
            `products`,
            {
                "enable_stock": false,
                "stock": 0,
                "contains_allergens": false,
                "sort_no": 0,
                "remote_id": 0,
                "category": categoryId,
                "extras": [
                    {
                        name: 'use_extras_as_variations',
                        price: 0
                    },
                    ...extras
                ],
                "name": item,
                "price": 0,
            }
        )
        console.log(data)
    }
}

// spread('665a5eb85fc5425eb29155e3', '665a5eb95fc5425eb291566a')
createProducts(
    '665a5eb85fc5425eb29155e9',
    ["BUTTER", "HONEY", "PISTACHIOS/ BADAMI", "PESHWARI", "PASANDA", "MALAYA Mixed fruit with pineapple.", "MINT", "LAAPSI SPECIAL MOZA"],
    [
        { name: "CHICKEN", price: 8.75  },
        { name: "LAMB", price: 8.95 },
        { name: "KING PRAWN", price: 11.95 },
    ]
)
// setFlag('665a5eb85fc5425eb29155e6')