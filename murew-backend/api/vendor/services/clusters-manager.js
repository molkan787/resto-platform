'use strict';

/**
 * `clusters-manager` service.
 */

const ProdCluster1 = Object.freeze({
    name: 'Prod-Cluster-1',
    public_ip: '144.126.225.131'
})

module.exports = {
    async pickCluster(){
        return Object.assign({}, ProdCluster1)
    }
}