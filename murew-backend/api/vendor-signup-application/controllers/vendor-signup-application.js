'use strict';
const { ObjectId } = require('mongodb')

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async createApplication(ctx){
        const result = await strapi.services['vendor-signup-application'].createApplication(ctx.request.body)
        const { id, status, cluster, error } = result
        if(error){
            ctx.send({ error })
        }else{
            ctx.send({ id, status, cluster })
        }
    },
    async getApplicationData(ctx){
        this._validateIdParam(ctx)
        const applicationData = await strapi.services['vendor-signup-application'].getPublicApplicationData(ctx.params.id)
        if(applicationData){
            ctx.send(applicationData)
        }else{
            ctx.throw(404, 'Not found')
        }
    },

    async verifyIdentity(ctx){
        this._validateIdParam(ctx)
        const data = await strapi.services['vendor-signup-application'].verifyIdentity(ctx.params.id)
        ctx.send(data)
    },
    
    async verifyDNS(ctx){
        this._validateIdParam(ctx)
        const data = await strapi.services['vendor-signup-application'].verifyDNS(ctx.params.id)
        ctx.send(data)
    },

    _validateIdParam(ctx){
        const { id } = ctx.params
        try {
            new ObjectId(id)
        } catch (error) {
            ctx.throw(400, 'Invalid Id')
        }
    }
};
