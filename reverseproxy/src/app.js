const hostsStore = require("./hosts-store");
const ProxyServer = require("./proxy-server");
const Router = require('node-simple-router');
const { IncomingMessage, ServerResponse } = require('http');

module.exports = class ReverseProxyApp{

    constructor(){
        const router = this.router = new Router();
        this.server = new ProxyServer({
            localhostHandler: (req, res) => {
                res.setHeader("Content-Type", "application/json");
                this.router(req, res);
            },
        });
        router.get('/hosts', (req, res) => this.handle_listHosts(req, res));
        router.post('/hosts/add', (req, res) => this.handle_addHost(req, res));
        router.post('/hosts/remove', (req, res) => this.handle_removeHost(req, res));
    }

    async start(port){
        await hostsStore.init();
        const mapping = await hostsStore.getAll();
        this.server.init(port || 80, mapping);
        console.log('Loaded mapping:');
        console.table(mapping)
        console.log('[App started]');
    }

    async addHost(sourceHost, target){
        if(!sourceHost || !target){
            throw new Error('Missing parameters');
        }
        await hostsStore.add(sourceHost, target);
        this.server.addMap(sourceHost, target);
    }
    
    async removeHost(sourceHost){
        if(!sourceHost){
            throw new Error('Missing parameter');
        }
        await hostsStore.remove(sourceHost);
        this.server.removeMap(sourceHost);
    }

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    handle_listHosts(req, res){
        const data = this.server.mapping;
        const response = JSON.stringify(data);
        res.end(response);
    }
    
    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    async handle_addHost(req, res){
        try {
            const { sourceHost, target } = req.body;
            await this.addHost(sourceHost, target);
            res.end(JSON.stringify({status: 'ok'}));
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.end('');
        }
    }

     /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    async handle_removeHost(req, res){
        try {
            const { sourceHost } = req.body;
            await this.removeHost(sourceHost);
            res.end(JSON.stringify({status: 'ok'}));
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.end('');
        }
    }

}