const DATA_COLLECTIONS = [
    'categories',
    'orders',
    'components_common_addresses',
    'components_products_extras',
    'stores',
    'components_order_order_item_extras',
    'components_order_order_items',
    'products',
    'pos_sync_keys',
    'components_order_addresses',
    'public_menus',
    'users-permissions_user',
    'offers',
    'bookings',
    'payments'
];

const SUPER_ADMIN_ROLE_CODE = 'strapi-super-admin';
const EDITOR_ROLE_CODE = 'strapi-editor';

module.exports = { DATA_COLLECTIONS, SUPER_ADMIN_ROLE_CODE, EDITOR_ROLE_CODE };