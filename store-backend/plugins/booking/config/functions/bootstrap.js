const pluginId = require('../../admin/src/pluginId');

module.exports = async () => {
    await strapi.admin.services.permission.actionProvider.register([
        {
            section: 'plugins',
            displayName: 'View Bookings',
            uid: 'view-list',
            subCategory: 'general',
            pluginName: pluginId,
        }
    ]);
}