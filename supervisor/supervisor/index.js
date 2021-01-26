const docker = require('./docker');
const MongoClient = require('mongodb').MongoClient;
const Consts = require('./constants');
const bootstrap = require('./bootstrap');
const { exec } = require('../helpers/shell');
const path = require('path');
const axios = require('axios');

module.exports = class MurewSupervisor{

    constructor(){
        this.apps = {};
    }

    async init(){
        await bootstrap();
        this.mongoClient = await MongoClient.connect('mongodb://root:murew_is_magic@localhost:27018');
    }

    /**
     * 
     * @param {{id: string, domain: string}} app 
     */
    async destroyVendorApp(app){
        const { id: appId, domain } = app;
        const container  = docker.getContainer('vendor_app_' + appId);
        await container.stop();
        await container.remove();
        await this.removeProxyHostMap(domain);
        await this.removeProxyHostMap(`backend.${domain}`);
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
        await this.addProxyHostMap(domain, `http://localhost:${frontendPort}`);
        await this.addProxyHostMap(`backend.${domain}`, `http://localhost:${backendPort}`);
    }

    async createVendorDB(appId){
        const { dbName, dbUser, dbPwd } = this._getDbInfo(appId);
        const db = this.mongoClient.db(dbName);
        await db.addUser(dbUser, dbPwd, {
            roles: [ "readWrite", "dbAdmin" ]
        });
        await this.importDbData(appId);
    }

    async importDbData(appId){
        const db_archive = path.join(path.dirname(__dirname), 'vendor_db');
        const bin = process.platform == 'win32' ? '"C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongorestore.exe"' : 'mongorestore';
        const { dbName } = this._getDbInfo(appId);
        const db_uri = this._getDbUri(appId, true);
        const cmd = `${bin} --nsFrom="murew-store-tmp.*" --nsTo="${dbName}.*" --uri="${db_uri}" --archive="${db_archive}"`;
        console.log('importDbData:cmd', cmd);
        await exec(cmd);
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

    async addProxyHostMap(sourceHost, target){
        await axios.post('http://localhost/hosts/add', { sourceHost, target });
    }
    
    async removeProxyHostMap(sourceHost){
        await axios.post('http://localhost/hosts/remove', { sourceHost });
    }

    async startVendorApp(appId){
        const container = this._getContainer(appId);
        await container.start();
    }

    _getDbUri(appId, fromLocalhost){
        const { dbName, dbUser, dbPwd } = this._getDbInfo(appId);
        const host = fromLocalhost ? 'localhost' : Consts.DB_HOST_NAME;
        const port = fromLocalhost ? 27018 : 27017;
        return `mongodb://${dbUser}:${dbPwd}@${host}:${port}/${dbName}?authSource=${dbName}`;
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