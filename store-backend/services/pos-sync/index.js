const MurewMenuSync = require("./menu-sync");
const MurewStockSync = require("./stock-sync");
const WebsocketServer = require("./websocket-server");
const { MurewActions } = require('murew-core/dist/enums');
const { sanitizeEntity } = require("strapi-utils/lib");

module.exports = class PosSyncService{

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

        // ---------- DEV ----------
        // server.on('client-connected', async (client) => {
        //     const order = await strapi.query('order').findOne({ id: '602fda18c958a669a8e6421d' });
        //     this.sendOrder(order);
        // });
        // -------------------------
    }

    onMessage(client, message){
        const { store_id } = client;
        const { action, data } = message;
        if([MurewActions.AcceptOrder, MurewActions.DeclineOrder].includes(action)){
            this.setOrderStatus(data, action);
        }else if(action == MurewActions.SetMenu){
            MurewMenuSync.setMenu(store_id, data);
        }else if(action == MurewActions.SyncStock){
            MurewStockSync.setStocks(data);
        }else if(action == MurewActions.RequestBookingsList){
            this.requestedBookingsList(client, data);
        }
    }

    // ----------------------------------------------------

    async requestedBookingsList({ store_id }, { dates }){
        const query = strapi.query('booking', 'booking');
        let bookings = await query.find({
            store_id,
            date_in: dates
        });
        bookings = bookings.map(b => sanitizeEntity(b, { model: query.model }));
        this.sendAction(MurewActions.SendBookingsList, bookings);
    }

    async setOrderStatus(data, action){
        const { id: orderId } = data;
        const status = action == MurewActions.AcceptOrder ? 'accepted' : 'declined';
        await strapi.services.postorder.setOrderStatus(data, status);
        this.sendAction(MurewActions.OrderStatusChanged, { id: orderId, status });
    }

    sendOrder(order){
        console.log('sending order', order)
        this.sendAction(MurewActions.NewOrder, order);
    }

}
