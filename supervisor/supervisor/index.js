const docker = require('./docker');
const { MongoClient, ObjectId } = require('mongodb');
const Consts = require('./constants');
const bootstrap = require('./bootstrap');
const { exec } = require('../helpers/shell');
const path = require('path');
const axios = require('axios');
const { randomString } = require('../utils');

const PUBLIC_WEB_PROTOCOL = 'https';
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017'

module.exports = class MurewSupervisor{

    constructor(){
        this.apps = {};
    }

    async init(){
        await bootstrap();
        this.mongoClient = await MongoClient.connect(DATABASE_URI, { useUnifiedTopology: true });
    }

    async updateVendorApp(app){
        await this.destroyVendorApp(app, true);
        await this.createVendorApp(app, true);
    }

    /**
     * 
     * @param {{id: string, domain: string}} app 
     */
    async destroyVendorApp(app, isUpdate){
        const { id: appId, domain } = app;
        const container  = docker.getContainer('vendor_app_' + appId);
        await container.stop();
        await container.remove();
        if(!isUpdate){
            await this.removeProxyHostMap(domain);
            await this.removeProxyHostMap(`backend.${domain}`);
        }
    }

    /**
     * @param {{id: string, domain: string, port_pointer: number}} app 
     */
    async createVendorApp(app, isUpdate){
        const { id: appId, domain, port_pointer: _port_pointer, registration_url } = app;
        let adminRegistrationUrl = '';
        if(!isUpdate){
            console.log('createVendorApp: Creating vendor database...');
            await this.createVendorDB(appId);
            if(registration_url === '--'){
                console.log('createVendorApp: Skiping creation of registration url')
                adminRegistrationUrl = '--'
            }else{
                console.log('createVendorApp: Creating vendor admin registration...');
                const urlPath = await this.createAdminAccountRegistration(appId);
                adminRegistrationUrl = `${PUBLIC_WEB_PROTOCOL}://backend.${domain}${urlPath}`;
            }
        }
        const DB_URI = this._getDbUri(appId);
        console.log('DB_URI', DB_URI);
        const port_pointer = parseInt(_port_pointer);
        const frontendPort = 8000 + port_pointer;
        const backendPort = 9000 + port_pointer;
        const backendUrl = `${PUBLIC_WEB_PROTOCOL}://backend.${domain}`;
        const frontendUrl = `${PUBLIC_WEB_PROTOCOL}://${domain}`;
        console.log('createVendorApp: Creating vendor\'s app container...');
        const container = await this.createVendorAppContainer(appId, {
            frontend: frontendPort,
            backend: backendPort
        }, [
            `VENDOR_ID=${appId}`,
            `DATABASE_URI=${DB_URI}`,
            'HOST=0.0.0.0',
            `BACKEND_URL=${backendUrl}`,
            `FRONTEND_URL=${frontendUrl}`,
            `DISTANCE_HELPER_URL=http://${Consts.DISTANCE_HELPER_NAME}:1338`
        ]);
        await container.start();
        console.log('createVendorApp: Adding domain mapping to reverse proxy server...');
        if(!isUpdate){
            await this.addProxyHostMap(domain, `http://127.0.0.1:${frontendPort}`);
            await this.addProxyHostMap(`backend.${domain}`, `http://127.0.0.1:${backendPort}`);
            await this.generateSSLCertificates(domain)
        }
        return {
            adminRegistrationUrl,
            serverIP: process.env.PUBLIC_IP
        }
    }

    async generateSSLCertificates(domain){
        const cmd = `certbot --nginx -d ${domain} -d backend.${domain}`
        const result = await exec(cmd)
        const str = result.stdout.toLowerCase()
        return (
            str.includes(`successfully deployed certificate for ${domain}`) &&
            str.includes(`successfully deployed certificate for backend.${domain}`)
        )
    }

    async createVendorDB(appId){
        const { dbName, dbUser, dbPwd } = this._getDbInfo(appId);
        const db = this.mongoClient.db(dbName);
        const sharedDb = this.mongoClient.db('murew-shared');
        await db.addUser(dbUser, dbPwd, {
            roles: [ "readWrite", "dbAdmin" ]
        });
        await sharedDb.addUser(dbUser, dbPwd, {
            roles: [ "read" ]
        });
        await this.importDbData(appId);
    }

    async importDbData(appId){
        const db_archive = path.join(path.dirname(__dirname), 'vendor_db');
        const bin = process.platform == 'win32' ? '"C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongorestore.exe"' : 'mongorestore';
        const { dbName } = this._getDbInfo(appId);
        const db_uri = this._getDbUri(appId, true);
        const cmd = `${bin} --nsFrom="murew-store-tmp.*" --nsTo="${dbName}.*" --nsInclude="murew-store-tmp.*" --uri="${db_uri}" --archive="${db_archive}"`;
        console.log('importDbData:cmd', cmd);
        await exec(cmd);
    }

    async createAdminAccountRegistration(appId){
        const { dbName } = this._getDbInfo(appId);
        const db = this.mongoClient.db(dbName);
        const role = await db.collection(Consts.DB_ROLES_COLLECTION_NAME).findOne({
            code: 'strapi-editor'
        })
        const registrationToken = randomString(40);
        await db.collection(Consts.DB_ADMINS_COLLECTION_NAME).insertOne({
            isActive: false,
            blocked: false,
            roles: [
                ObjectId(role._id)
            ],
            username: null,
            registrationToken: registrationToken,
            firstname: "",
            lastname: "",
            email: "store.admin@murew.com",
            __v:0
        });
        return `/admin/auth/register?registrationToken=${registrationToken}`;
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
        await axios.post('http://localhost:1340/hosts/add', { sourceHost, target });
    }
    
    async removeProxyHostMap(sourceHost){
        await axios.post('http://localhost:1340/hosts/remove', { sourceHost });
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