export enum MurewActions{
    NewOrder = 'new-order',
    OrderStatusChanged = 'order-status-changed',
    AcceptOrder = 'accept-order',
    DeclineOrder = 'decline-order',
    SetMenu = 'set-menu',
    SyncMenu = 'sync-menu',
    SyncStock = 'sync-stock',
    RequestBookingsList = 'request-bookings-list',
    SendBookingsList = 'send-bookings-list',
    BookingsReceivedConfirmation = 'bookings-received-confirmation',
    StartBookingsSyncingProcess = 'start-bookings-syncing-process',
    SetBookingSlots = 'set-booking-slots',
}