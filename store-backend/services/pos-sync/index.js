const MurewMenuSync = require("./menu-sync");
const MurewStockSync = require("./stock-sync");
const WebsocketServer = require("./websocket-server");
const { MurewActions } = require('murew-core/dist/enums');
const { generateReferenceNumber } = require('murew-core');
const { sanitizeEntity } = require("strapi-utils/lib");
const Time = require('../../utils/time');

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
        // server.on('message', (_client, msg) => console.log(msg));

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
        }else if(action == MurewActions.SendBookingsList){
            this.gotUpdatedBookings(client, data);
        }else if(action == MurewActions.SetBookingSlots){
            this.setBookingSlots(client, data);
        }
    }

    // ----------------------------------------------------

    async setBookingSlots({ store_id }, { booking_slots }){
        const slots = booking_slots.filter(s => s.time_slots && s.time_slots.length > 0);
        slots.forEach(slot => slot.time_slots = slot.time_slots.map(ts => ({ time: ts + ':00.000' })));
        console.log('store_id', store_id)
        await strapi.query('store').update({
            id: store_id
        },{
            booking_slots: slots
        });
    }

    async requestBookingsSyncing(){
        this.sendAction(MurewActions.StartBookingsSyncingProcess, {});
    }

    async requestedBookingsList({ store_id }, { timestamp }){
        const query = strapi.query('booking', 'booking');
        const date = new Date(timestamp * 1000);
        const now = Time.now();
        console.log('requestedBookingsList', date)
        let bookings = await query.model.find({
            store_id,
            updatedAt: {
                $gte: date
            }
        });
        bookings = bookings.map(b => sanitizeEntity(b, { model: query.model }));
        this.sendAction(MurewActions.SendBookingsList, {
            bookings,
            timestamp: now
        });
    }

    async gotUpdatedBookings({ store_id }, { bookings, timestamp }){
        const { model } = strapi.query('booking', 'booking');
        const nos = bookings.map(b => b.no);
        const existingBookings = await model.find({ no: { $in: nos } });
        const queries = bookings.map(booking => model.findOneAndUpdate(
            {
                no: booking.no
            },
            {
                ...booking,
                store_id
            },
            {
                upsert: true,
                new: true
            }
        ));
        const upsertedBookings = await Promise.all(queries);
        await strapi.plugins.booking.services.bookedslots.updateDiffrences(upsertedBookings, existingBookings);

        this.sendAction(MurewActions.BookingsReceivedConfirmation, { 
            timestamp
        })
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
