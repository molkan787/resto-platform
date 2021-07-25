const pluginId = require('../../admin/src/pluginId');

module.exports = async () => {
    await strapi.admin.services.permission.actionProvider.register([
        {
            section: 'plugins',
            displayName: 'Manage',
            uid: 'manage',
            subCategory: 'general',
            pluginName: pluginId,
        }
    ]);
}