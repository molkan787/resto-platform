const mongoose = require('mongoose');

module.exports = class MurewMenuSync{

    static async setMenu(store_id, data){
        const { menu } = data;
        const queries = menu.map(cat => this.upsertCategory(cat, store_id));
        const response = await Promise.all(queries);
        const categories = [].concat(...response.map(d => d.categories));
        const products = [].concat(...response.map(d => d.products));

        await strapi.query('category').delete({
            store_id,
            id_nin: categories,
            remote_id_null: false
        });

        await strapi.query('product').delete({
            store_id,
            id_nin: products,
            remote_id_null: false
        });
    }

    static async upsertCategory(category, store_id, parentId){
        const { children, products, ...data } = category;
        const entry = await strapi.query('category').model.findOneAndUpdate(
            {
                remote_id: data.remote_id
            },
            {
                ...data,
                store_id,
                parent: parentId ? new mongoose.Types.ObjectId(parentId) : undefined
            },
            {
                upsert: true,
                new: true
            }
        );
        const { _id } = entry;
        const _children = await Promise.all(children.map(c => this.upsertCategory(c, store_id, _id)));

        const queries = products.map(p => this.upsertProduct(p, store_id, _id));
        const _products = await Promise.all(queries);
        return {
            categories: [_id, ...[].concat(..._children.map(c => c.categories))],
            products: _products.concat(..._children.map(c => c.products))
        };
    }

    static async upsertProduct(product, store_id, categoryId){
        const { category, ...data } = product;
        const { _id } = await strapi.query('product').model.findOneAndUpdate(
            {
                remote_id: data.remote_id
            },
            {
                ...data,
                category: categoryId,
                store_id
            },
            {
                upsert: true,
                new: true
            }
        );
        return _id;
    }

}