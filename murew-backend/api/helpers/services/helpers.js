'use strict';
const dns = require('dns')

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    resolveHostIps(host){
        return new Promise((resolve, reject) => {
            dns.resolve(host, (err, addresses) => {
                if(err) reject(err)
                else resolve(addresses)
            })
        })
    }
};
