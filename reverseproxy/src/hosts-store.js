const nodePersist = require('node-persist');

const MAP_ITEM_PREFIX = 'revproxy_map_';

module.exports = new class HostsStore{

    async init(){
        await nodePersist.init({
            dir: './storage'
        })
    }

    add(sourceHost, target){
        return nodePersist.setItem(MAP_ITEM_PREFIX + sourceHost, {
            sourceHost,
            target
        });
    }

    remove(sourceHost){
        return nodePersist.removeItem(MAP_ITEM_PREFIX + sourceHost);
    }

    async getAll(){
        const items = await nodePersist.valuesWithKeyMatch(new RegExp(`^(${MAP_ITEM_PREFIX})`));
        return items.reduce((m, { sourceHost, target }) => {
            m[sourceHost] = target;
            return m;
        }, {});
    }

}