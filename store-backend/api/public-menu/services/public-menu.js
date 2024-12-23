'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */
const NotFoundError = require('../../../errors/NotFoundError');
module.exports = {

    async getMenu(store_id){
        const store = await strapi.query('store').findOne({ id: store_id });
        if(!store || !store.active){
            throw new NotFoundError(`Store "${store_id}" not found`);
        }
        const categories = await strapi.query('category').find({ store_id, _sort: 'sort_no:desc' });
        categories.forEach(cat => cat.children = []);
        const map = categories.reduce((m, c) => (m[c.id] = c) && m, {});
        for(const cat of categories){
            cat.products = cat.products instanceof Array ? cat.products.sort((a, b) => b.sort_no - a.sort_no) : cat.products;
            if(cat.parent){
                const parentId = typeof cat.parent == 'string' ? cat.parent : cat.parent.id;
                map[parentId].children.push(cat);
            }
        }
        const offers = await strapi.query('offer').model.find({
            store_id: store_id,
            published_at: { $ne:null },
            activated_by_promo_code: { $ne: true },
            $or: [
                { expires: { $gt: new Date() } },
                { expires: { $eq: null } }
            ]
        });
        const { preorder_slots, enable_preorders } = await strapi.query('store-settings').findOne();
        return {
            categories: categories.filter(c => !c.parent),
            offers,
            preorder_slots: enable_preorders ? preorder_slots : []
        }
    }

};
