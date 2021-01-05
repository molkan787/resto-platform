const docker = require('./docker');
const MongoClient = require('mongodb').MongoClient;

module.exports = class MurewSupervisor{

    constructor(){
        this.apps = {};
    }

    async init(){
        this.mongoClient = await MongoClient.connect('mongodb://root:murew_is_magic@localhost:27018');
    }

    async createVendorApp(appId, start){
        await this.createVendorDB(appId);
        const DB_URI = this._getDbUri(appId);
        console.log('DB_URI', DB_URI); return;
        const container = await this.createVendorAppContainer(appId, {
            frontend: 81,
            backend: 1337
        }, [
            `DATABASE_URI=${DB_URI}`
        ]);
        if(start){
            await container.start();
        }
    }

    async createVendorDB(appId){
        const { dbName, dbUser, dbPwd } = this._getDbInfo(appId);
        const db = this.mongoClient.db(dbName);
        await db.addUser(dbUser, dbPwd, {
            roles: [ "readWrite", "dbAdmin" ]
        });
    }

    async createVendorAppContainer(appId, ports, envs){
        const { frontend, backend } = ports;
        const container = await docker.createContainer({
            name: 'vendor_app_' + appId,
            Image: 'murew-vendor:alpha1',
            Env: envs,
            HostConfig: {
                NetworkMode: 'vendor_apps_sharednetwork',
                PortBindings: {
                    "1337/tcp": [{
                        HostPort: backend.toString()
                    }],
                    "3000/tcp": [{
                        HostPort: frontend.toString()
                    }]
                }
            }
        })
        return container;
    }

    async startVendorApp(appId){
        const container = this._getContainer(appId);
        await container.start();
    }

    _getDbUri(appId){
        const { dbName, dbUser, dbPwd } = this._getDbInfo(appId);
        return `mongodb://${dbUser}:${dbPwd}@shared_mongodb:27017/${dbName}`;
    }

    _getDbInfo(appId){
        const dbName = 'vendor_db_' + appId;
        const dbUser = 'vendor_db_user_' + appId;
        const dbPwd = 'pwd_' + appId;
        return { dbName, dbUser, dbPwd };
    }

    _addApp(appId, containerId, isRunning){
        this.apps[appId] = {
            appId,
            containerId,
            isRunning
        };
    }

    _getContainer(appId){
        const app = this.apps[appId];
        const conId = app && app.containerId;
        return conId && docker.getContainer(conId) || null;
    }

}