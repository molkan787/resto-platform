'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
    lifecycles: {
        async afterCreate(data){
            await setStripeKeysInSharedDb(data);
        },
        async afterUpdate(data){
            await setStripeKeysInSharedDb(data);
        }
    }
};

async function setStripeKeysInSharedDb(data){
    const { publishable_key, secret_key } = data;
    const db = await strapi.services.shareddb.getDb();
    await db.collection('settings').updateOne({}, {
        $set: {
            stripe_sk: secret_key,
            stripe_pk: publishable_key
        }
    }, {
        upsert: true
    });
}