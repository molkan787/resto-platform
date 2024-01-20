'use strict';

const { GridFSBucket, ObjectId } = require('mongodb')

/**
 * mobile-app.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

module.exports = {

    // TODO: TODO-SECURITY confirm iconFileData is a valid image file data
    async requestMobileAppBuild({ iconFileData, primaryColor }){
        const vendorId = this.getCurrentVendorId()
        const backendURL = process.env.BACKEND_URL || 'http://localhost:1337'
        const restaurantDomain = new URL(process.env.FRONTEND_URL || 'http://dev-restaurant.com').host
        const packageName = restaurantDomain.replace(/-/g,'').replace(/_/g,'').split('.').reverse().join('.')

        const plan = await strapi.services.shared.getVendorPlan();
        let vendorName = plan.vendor_name
        if(vendorName === '--') vendorName = 'Dev Vendor'

        const doc = {
            status: 'queued',
            createdAt: new Date(),
            vendorId,
            packageName,
            appDisplayName: vendorName,
            backendURL,
            iconFileData: Buffer.from(iconFileData, 'base64'),
            primaryColor,
        }
        
        const coll = strapi.services.shared.sharedDb.collection('queue_build_mobile_client')
        await coll.deleteMany({
            vendorId: vendorId
        })
        await coll.insertOne(doc)
        
    },

    async getStatus(){
        await strapi.services.shared.getReady()
        const coll = strapi.services.shared.sharedDb.collection('queue_build_mobile_client')
        const vendorId = this.getCurrentVendorId()
        const doc = await coll.findOne({ vendorId })
        if(doc){
            const { status, appDisplayName, createdAt } = doc
            return { status, appDisplayName, createdAt }
        }else{
            return null
        }
    },

    async getBuiltOutput(){
        await strapi.services.shared.getReady()
        const vendorId = this.getCurrentVendorId()
        const bucket = new GridFSBucket(strapi.services.shared.sharedDb, { bucketName: 'build_outputs' })
        const files = await bucket.find({
            metadata: {
                appType: 'store-mobile-client',
                reference: vendorId
            }
        }).toArray()
        if(files.length > 0){
            const downloadStream = bucket.openDownloadStream(new ObjectId(files[0]._id))
            return downloadStream
        }
        return null
    },

    getCurrentVendorId(){
        return strapi.config.vendor.VENDOR_ID
    }

};
