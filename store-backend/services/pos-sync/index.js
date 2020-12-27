const WebsocketServer = require("./websocket-server")

module.exports = class PosSyncService{

    async setOrderStatus(orderId, action){
        const status = action == MurewActions.AcceptOrder ? 'accepted' : 'declined';
        await strapi.services.postorder.setOrderStatus(orderId, status);
        this.sendAction(MurewActions.OrderStatusChanged, { id: orderId, status })
    }

    sendOrder(order){
        console.log('sending order', order)
        this.sendAction(MurewActions.NewOrder, order);
    }

    // ----------------- Internal methods -----------------

    sendAction(actionName, data){
        this.server.send({
            action: actionName,
            data
        })
    }

    init(httpServer){
        const server = this.server = this.server = new WebsocketServer(httpServer);
        server.on('message', msg => this.onMessage(msg));
    }

    onMessage(message){
        const { action, data } = message;
        if([MurewActions.AcceptOrder, MurewActions.DeclineOrder].includes(action)){
            this.setOrderStatus(data.id, action);
        }
    }

}

const MurewActions = {
    NewOrder: 'new-order',
    OrderStatusChanged: 'order-status-changed',
    AcceptOrder: 'accept-order',
    DeclineOrder: 'decline-order',
}