'use strict';

const { validateApplicationData } = require('./application-data-schema')

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {

    async createApplication(data){
        const { value, error } = validateApplicationData(data)
        if(error){
            return { error }
        }
        const { domain_name } = value
        if(await this.isDomainAlreadyRegistered(domain_name)){
            return { error: `Domain name "${domain_name}" is already registered in our system, Please use another.` }
        }
        const picked_cluster = await strapi.services['clusters-manager'].pickCluster()
        const { id, status, cluster } = await strapi.query('vendor-signup-application').create({
            status: 'identity_verification',
            data: value,
            cluster: picked_cluster
        })
        return { id, status, cluster: { public_ip: cluster.public_ip } }
    },

    async isDomainAlreadyRegistered(domainName){
        const vendor = await strapi.query('vendor').findOne({ domain: domainName })
        return !!vendor
    },

    async getPublicApplicationData(applicationId){
        if(!applicationId) throw new Error('applicationId is required')
        const doc = await strapi.query('vendor-signup-application').findOne({ id: applicationId })
        if(doc){
            const { id, status, data, cluster } = doc
            return { id, status, data, cluster: { public_ip: cluster.public_ip } }
        }else{
            return null
        }
    },

    async verifyIdentity(applicationId){
        if(!applicationId) throw new Error('applicationId is required')
        const { status } = await strapi.query('vendor-signup-application').update(
            { id: applicationId },
            { status: 'awaiting_dns' }
        )
        return { status }
    },

    async verifyDNS(applicationId){
        if(!applicationId) throw new Error('applicationId is required')
        const doc = await strapi.query('vendor-signup-application').findOne({ id: applicationId })
        if(doc && doc.status === 'awaiting_dns'){
            const { id, data, cluster } = doc
            const { domain_name } = data
            const backend_domain_name = 'backend.' + domain_name
            const { public_ip } = cluster
            const check1 = await strapi.services.helpers.isDomainPointingToIp(domain_name, public_ip)
            const check2 = await strapi.services.helpers.isDomainPointingToIp(backend_domain_name, public_ip)

            if(check1 && check2){ // DNS Config is valid (domains points to server's ip)
                const aid = applicationId
                strapi.services['client-registration'].registerClient(data, cluster)
                .then(() => {
                    return strapi.query('vendor-signup-application').update(
                        { id: aid },
                        { status: 'completed' }
                    )
                }).catch(err => {
                    console.error(`Vendor registration failed { applicationId = ${id}, domain = ${domain_name} }`)
                    console.error(err)
                })
                const { status } = await strapi.query('vendor-signup-application').update(
                    { id: applicationId },
                    { status: 'creating_vendor' }
                )
                return { status }
            }else{
                return { status: 'awaiting_dns' }
            }
    
        }
        return null
    },


};