<template>
  <Page>
    <TabView>
      <TabPanel v-for="cat in categories" :key="cat.slug" :header="cat.name"></TabPanel>
    </TabView>
    <Category v-for="cat in categories" :key="cat.slug" :category="cat" />
  </Page>
</template>

<script>
export default {
  data: () => ({
    currentCategoryIndex: 0,
    categories: [
      {
        name: 'Starters',
        slug: 'starters',
        products: [
          {
            id: 1,
            name: 'Lassoni Pasaliyan',
            description: 'Free Range Wiltshire Lamb Chops with Raw Papaya and Cashew Nuts served with Curried Carrot Mash. (Three Pieces)',
            price: 7.5,
          },{
            id: 2,
            name: 'Murgh Malai Tikka',
            description: 'Free Range Tandoori Grilled Chicken Breast, with Paprika, Ginger, Garlic, and Greek Yoghurt.',
            price: 6.45
          },{
            id: 7,
            name: 'Zafrani Jhinga',
            description: 'Freshwater King Prawns, Saffron, Chia Seed, Bok Choy and Citrus Salsa.',
            price: 7.5
          }
        ]
      },
      {
        name: 'Signature Dishes',
        slug: 'signature_dishes',
        products: [
          {
            id: 3,
            name: 'Mint Room Butter Chicken',
            description: 'Free Range Wiltshire Lamb Chops with Raw Papaya and Cashew Nuts served with Curried Carrot Mash. (Three Pieces)',
            price: 12,
          },{
            id: 4,
            name: 'Kozhi Nadan Curry',
            description: 'Free Range Tandoori Grilled Chicken Breast, with Paprika, Ginger, Garlic, and Greek Yoghurt.',
            price: 12.95
          }
        ]
      },
      {
        name: 'Dum Biriyani',
        slug: 'dum_biriyani',
        products: [
          {
            id: 5,
            name: 'Chicken Dum Biriyani',
            description: 'Free Range Wiltshire Lamb Chops with Raw Papaya and Cashew Nuts served with Curried Carrot Mash. (Three Pieces)',
            price: 13.95,
          },{
            id: 6,
            name: 'Lamb Dum Biriyani',
            description: 'Free Range Tandoori Grilled Chicken Breast, with Paprika, Ginger, Garlic, and Greek Yoghurt.',
            price: 14.95
          }
        ]
      }
    ]
  })
}
</script>