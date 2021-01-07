module.exports = class MurewMenuSync{

    static async setMenu(store_id, data){
        const { menu } = data;
        await strapi.query('category').delete({ store_id });
        await strapi.query('product').delete({ store_id });
        const queries = menu.map(cat => this.createCategory(cat, store_id));
        await Promise.all(queries);
    }

    static async createCategory(category, store_id){
        const { children, products, ...data } = category;
        const _children = await Promise.all(children.map(c => this.createCategory(c, store_id)));
        const entry = await strapi.query('category').create({
            ...data,
            children: _children,
            store_id
        });
        const queries = products.map(p => this.createProduct(p, store_id, entry.id));
        await Promise.all(queries);
        return entry;
    }

    static async createProduct(product, store_id, categoryId){
        const { category, ...data } = product;
        await strapi.query('product').create({
            ...data,
            category: categoryId,
            store_id
        });
    }

}