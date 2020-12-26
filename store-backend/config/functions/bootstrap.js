'use strict';
const PosSyncService = require('../../services/pos-sync');

module.exports = () => {
    const posSyncService = new PosSyncService();
    posSyncService.init(strapi.server);
    strapi.services.posSyncService = posSyncService;
};
