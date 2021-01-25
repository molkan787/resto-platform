const httpProxy = require('http-proxy');
const http = require('http');

module.exports = class ProxyServer{

    constructor(options){
        const _o = options || {};
        this.mapping = {};
        this.localhostHandler = _o.localhostHandler || null;
    }

    addMap(sourceHost, target){
        this.mapping[sourceHost] = target;
    }

    removeMap(sourceHost){
        delete this.mapping[sourceHost];
    }

    init(port, mapping){
        const _Port = port || 80;
        this.mapping = mapping || {};
        this.proxyServer = new httpProxy.createServer({});
        const httpServer = this.httpServer = http.createServer((req, res) => this._onRequest(req, res));
        httpServer.on('upgrade', (req, socket, head) => this._onUpgrade(req, socket, head));

        // Debug logging
        httpServer.on('listening', () => console.log(`HTTP Server listening on port ${_Port}`));
        httpServer.on('error', err => console.error(err));
        // -------------

        httpServer.listen(_Port);
    }

    _onRequest(req, res){
        try {
            const host = req.headers.host.split(':')[0];

            const isLocalhost = host == 'localhost' || host == '127.0.0.1';
            if(isLocalhost){
                if(this.localhostHandler){
                    this.localhostHandler(req, res);
                }else{
                    res.writeHead(403, { 'Content-Type': 'text/plain' });
                    res.end('You are not allowed to access localhost');
                }
                return;
            }

            const target = this.mapping[host];
            if(target){
                this.proxyServer.web(req, res, { target }, e => console.error(e));
            }else{
                // cannot find route mapping rule
                console.warn("cannot find rule in the mapping:", host);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`The resource ${host} was either moved or deactivated.`);
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