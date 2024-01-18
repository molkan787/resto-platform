'use strict';

(function printEnvVars(){
    console.log('==============================================================')
    console.log('========================== ENV VARS ==========================')
    console.log(Object.entries(process.env).map(e => `${e[0]}=${e[1]}`).join('\n'))
    console.log('==============================================================')
    console.log('==============================================================')
})()

const PosSyncService = require('../../services/pos-sync');

module.exports = () => {
    const posSyncService = new PosSyncService();
    posSyncService.init(strapi.server);
    strapi.services.posSyncService = posSyncService;
};

