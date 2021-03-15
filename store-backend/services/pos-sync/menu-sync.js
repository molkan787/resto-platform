const mongoose = require('mongoose');
const { OfferGetType } = require('murew-core/dist/interfaces/Offer');

module.exports = class MurewMenuSync{

    static async setMenu(store_id, data){
        const { menu, offers } = data;
        const queries = menu.map(cat => this.upsertCategory(cat, store_id));
        const response = await Promise.all(queries);
        const categories = [].concat(...response.map(d => d.categories));
        const products = [].concat(...response.map(d => d.products));

        for(let offer of offers){
            const { benefits: [benefit] } = offer;
            if(benefit.type == OfferGetType.FreeItems){
                if(benefit.all_items){
                    benefit.items = [];
                }else{
                    const items = await strapi.query('product').find({
                        remote_id_in: benefit.items
                    });
                    benefit.items = items.map(item => item.id);
                }
            }
            offer.published_at = new Date();
            offer.store_id = store_id;
            offer.remote_id = offer.id;
            delete offer.id;
            ['available_on_delivery',
            'available_on_pickup',
            'available_on_website',
            'available_on_pos',
            'activated_by_promo_code']
            .forEach(prop => offer[prop] = !!offer[prop]);
        }

        const offersIds = await Promise.all(offers.map(offer => this.upsertOffer(offer)));

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
        
        await strapi.query('offer').delete({
            store_id,
            id_nin: offersIds,
            remote_id_null: false
        });

    }

    static async upsertOffer(offer){
        const query = strapi.query('offer');
        const entry = await query.findOne({ remote_id: offer.remote_id });
        if(entry){
            await query.update({ id: entry.id }, offer);
            return entry.id;
        }else{
            const { id } = await query.create(offer);
            return id;
        }
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