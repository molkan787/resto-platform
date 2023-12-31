const { IncomingMessage, ServerResponse } = require('http');
const NginxConf = require('./nginxconf')
const express = require('express')

module.exports = class ReverseProxyApp{

    constructor(){
        this.server = express()
        this.server.use(express.json())
        this.server.get('/hosts', (req, res) => this.handle_listHosts(req, res));
        this.server.post('/hosts/add', (req, res) => this.handle_addHost(req, res));
        this.server.post('/hosts/remove', (req, res) => this.handle_removeHost(req, res));
    }

    async start(){
        const port = process.env.PORT || 1340
        this.server.listen(port, () => {
            console.log(`[App started] listen port ${port}`);
        })
        // console.log('Loaded mapping:');
        // console.table(mapping)
    }

    async addHost(sourceHost, target){
        if(!sourceHost || !target){
            throw new Error('Missing parameters');
        }
        await NginxConf.addVirtualHost(sourceHost, target)
    }
    
    async removeHost(sourceHost){
        if(!sourceHost){
            throw new Error('Missing parameter');
        }
        await NginxConf.removeVirtualHost(sourceHost)
    }

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    handle_listHosts(req, res){
        const data = this.server.mapping;
        const response = JSON.stringify(data);
        res.setHeader("Content-Type", "application/json");
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
            res.setHeader("Content-Type", "application/json");
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
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({status: 'ok'}));
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.end('');
        }
    }

}