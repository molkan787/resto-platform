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
        const categories = await strapi.query('category').find({ store_id });
        categories.forEach(cat => cat.children = []);
        const map = categories.reduce((m, c) => (m[c.id] = c) && m, {});
        for(const cat of categories){
            if(cat.parent){
                const parentId = typeof cat.parent == 'string' ? cat.parent : cat.parent.id;
                map[parentId].children.push(cat);
            }
        }
        const offers = await strapi.query('offer').find({ store_id, published_at_null: false });
        return {
            categories: categories.filter(c => !c.parent),
            offers
        }
    }

};
