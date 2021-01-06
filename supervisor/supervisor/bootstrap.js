const docker = require('./docker');
const MongoClient = require('mongodb').MongoClient;
const Consts = require('./constants');

module.exports = async function bootstrap(){
    const networks = await docker.listNetworks();
    const appsNetwork = networks.find(n => n.Name == Consts.APPS_NETWORK_NAME);
    if(!appsNetwork){
        await docker.createNetwork({
            Name: Consts.APPS_NETWORK_NAME
        })
    }
}