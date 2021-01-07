const MurewMenuSync = require("./menu-sync");
const MurewStockSync = require("./stock-sync");
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
        const server = this.server = new WebsocketServer(httpServer);
        server.on('message', (client, msg) => this.onMessage(client, msg));
    }

    onMessage({ store_id }, message){
        const { action, data } = message;
        if([MurewActions.AcceptOrder, MurewActions.DeclineOrder].includes(action)){
            this.setOrderStatus(data.id, action);
        }else if(action == MurewActions.SetMenu){
            MurewMenuSync.setMenu(store_id, data);
        }else if(action == MurewActions.SyncStock){
            MurewStockSync.setStocks(data);
        }
    }

}

const MurewActions = {
    NewOrder: 'new-order',
    OrderStatusChanged: 'order-status-changed',
    AcceptOrder: 'accept-order',
    DeclineOrder: 'decline-order',
    SetMenu: 'set-menu',
    SyncMenu: 'sync-menu',
    SyncStock: 'sync-stock'
}