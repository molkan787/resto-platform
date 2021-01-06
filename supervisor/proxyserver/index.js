const httpProxy = require('http-proxy');
const http = require('http');

module.exports = class ProxyServer{

    constructor(){
        this.mapping = {};
    }

    addMap(sourceHost, target){
        this.mapping[sourceHost] = target;
    }

    removeMap(sourceHost){
        delete this.mapping[sourceHost];
    }

    init(port, mapping){
        this.mapping = mapping || {};
        this.proxyServer = new httpProxy.createServer({});
        const httpServer = this.httpServer = http.createServer((req, res) => this._onRequest(req, res));
        httpServer.on('upgrade', (req, socket, head) => this._onUpgrade(req, socket, head));
        httpServer.listen(port || 80);
    }

    _onRequest(req, res){
        try {
            const host = req.headers.host.split(':')[0];
            const target = this.mapping[host];
            if(target){
                // console.log(`Proxied ${host} to ${target}`);
                this.proxyServer.web(req, res, { target }, e => console.error(e));
            }else{
                // cannot find route mapping rule
                console.warn("cannot find rule in the mapping:", mapFrom);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end("Unmapped url: " + mapFrom);
            }
        } catch (error) {
            console.error(error);
        }
    }

    _onUpgrade(req, socket, head){
        try {
            const host = req.headers.host.split(':')[0];
            const target = this.mapping[host];
            if(target){
                this.proxyServer.ws(req, socket, head, { target }, e => console.error(e));
            }else{
                try {
                    socket.close();
                } catch (error) {
                    
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

}