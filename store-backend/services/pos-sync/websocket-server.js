const WebSocketServer = require('websocket').server;
const EventEmitter = require('eventemitter3');

module.exports = class WebsocketServer extends EventEmitter{

    constructor(httpServer){
        super();
        this.clients = [];
        const server = new WebSocketServer({
            httpServer,
            autoAcceptConnections: false
        });
        this.server = server;
        
        server.on('request', (request) => {
            const auth = request.httpRequest.headers.authorization;
            if(!this.isAllowed(auth)){
                request.reject(401);
                console.log((new Date()) + ' Connection rejected.');
                return;
            }
            const connection = request.accept('murew-protocol', request.origin);
            this.clients.push(connection);
            console.log((new Date()) + ' Connection accepted.');
            connection.on('message', (message) => {
                if (message.type === 'utf8') {
                    // console.log('Received Message: ' + message.utf8Data);
                    try {
                        const data = JSON.parse(message.utf8Data);
                        this.emit('message', data);
                    } catch (error) {
                        
                    }
                }
            });
            connection.on('close', (reasonCode, description) => {
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
                const index = this.clients.indexOf(connection);
                this.clients.splice(index, 1);
            });
        });
    }

    isAllowed(authorization){
        return true;
    }

    send(data){
        const _data = JSON.stringify(data);
        for(let client of this.clients){
            client.send(_data);
        }
    }

}