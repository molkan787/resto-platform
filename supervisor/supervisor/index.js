const docker = require('./docker');
const MongoClient = require('mongodb').MongoClient;
const Consts = require('./constants');
const bootstrap = require('./bootstrap');
const ProxyServer = require('../proxyserver');
const { readFile } = require('../helpers/fs');

module.exports = class MurewSupervisor{

    constructor(){
        this.apps = {};
        this.proxyServer = new ProxyServer();
    }

    async init(){
        await bootstrap();
        this.mongoClient = await MongoClient.connect('mongodb://root:murew_is_magic@localhost:27018');
        this.proxyServer.init(80, {});
    }

    /**
     * 
     * @param {{id: string, domain: string, port_pointer: number}} app 
     * @param {boolean} start 
     */
    async createVendorApp(app, start){
        const { id: appId, domain, port_pointer: _port_pointer } = app;
        await this.createVendorDB(appId);
        const DB_URI = this._getDbUri(appId);
        console.log('DB_URI', DB_URI);
        const port_pointer = parseInt(_port_pointer);
        const frontendPort = 8000 + port_pointer;
        const backendPort = 9000 + port_pointer;
        const backendUrl = `http://backend.${domain}`;
        const container = await this.createVendorAppContainer(appId, {
            frontend: frontendPort,
            backend: backendPort
        }, [
            `DATABASE_URI=${DB_URI}`,
            'HOST=0.0.0.0',
            `BACKEND_URL=${backendUrl}`,
        ]);
        if(start){
            await container.start();
        }
        this.proxyServer.addMap(domain, `http://localhost:${frontendPort}`);
        this.proxyServer.addMap(`backend.${domain}`, `http://localhost:${backendPort}`);
    }

    async createVendorDB(appId){
        const { dbName, dbUser, dbPwd } = this._getDbInfo(appId);
        const db = this.mongoClient.db(dbName);
        await db.addUser(dbUser, dbPwd, {
            roles: [ "readWrite", "dbAdmin" ]
        });
        await this.importDbData(db);
    }

    async importDbData(db){
        const rawData = await readFile('./db.json');
        const collections = JSON.parse(rawData);
        const queries = collections.map(({ collectionName, docs }) => (
            docs.length ? db.collection(collectionName).insertMany(docs) : Promise.resolve()
        ));
        await Promise.all(queries);
    }

    async createVendorAppContainer(appId, ports, envs){
        const { frontend, backend } = ports;
        const container = await docker.createContainer({
            name: 'vendor_app_' + appId,
            Image: Consts.APP_IMAGE_NAME,
            Env: envs,
            HostConfig: {
                NetworkMode: Consts.APPS_NETWORK_NAME,
                PortBindings: {
                    "1337/tcp": [{
                        HostPort: backend.toString()
                    }],
                    "3000/tcp": [{
                        HostPort: frontend.toString()
                    }]
                },
                RestartPolicy: {
                    Name: 'always'
                }
            },
        })
        return container;
    }

    async startVendorApp(appId){
        const container = this._getContainer(appId);
        await container.start();
    }

    _getDbUri(appId){
        const { dbName, dbUser, dbPwd } = this._getDbInfo(appId);
        return `mongodb://${dbUser}:${dbPwd}@${Consts.DB_HOST_NAME}:27017/${dbName}`;
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