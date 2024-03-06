'use strict';

const { GridFSBucket, ObjectId } = require('mongodb')

const BUILD_APP_TYPES = Object.freeze({
    MOBILE_STOREFRONT_ANDROID: 'mobile-storefront-android',
    MOBILE_STOREFRONT_IOS: 'mobile-storefront-ios',
})

/**
 * mobile-app.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

module.exports = {

    BUILD_APP_TYPES,

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
            primaryColor: this.convertHexToRGB(primaryColor),
        }
        
        const coll = strapi.services.shared.sharedDb.collection('queue_build_mobile_client')
        await coll.deleteMany({
            vendorId: vendorId
        })

        doc.appType = BUILD_APP_TYPES.MOBILE_STOREFRONT_ANDROID
        await coll.insertOne(Object.assign({}, doc))
        doc.appType = BUILD_APP_TYPES.MOBILE_STOREFRONT_IOS
        await coll.insertOne(Object.assign({}, doc))
        
    },

    async getStatus(){
        await strapi.services.shared.getReady()
        const coll = strapi.services.shared.sharedDb.collection('queue_build_mobile_client')
        const vendorId = this.getCurrentVendorId()
        const docs = await coll.find({ vendorId }).toArray()
        return docs.map(doc => {
            const { status, appDisplayName, appType, createdAt } = doc
            return { status, appDisplayName, appType, createdAt }
        })
    },

    async getBuiltOutput(appType){
        await strapi.services.shared.getReady()
        const vendorId = this.getCurrentVendorId()
        const bucket = new GridFSBucket(strapi.services.shared.sharedDb, { bucketName: 'build_outputs' })
        const files = await bucket.find({
            metadata: {
                appType: appType,
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
    },

    convertHexToRGB(hexColor){
        if(typeof hexColor !== 'string') throw new Error('Invalid input')
        if(hexColor.length !== 7) throw new Error('Invalid hex color code length')
        const r = parseInt(hexColor.substring(1, 3), 16)
        const g = parseInt(hexColor.substring(3, 5), 16)
        const b = parseInt(hexColor.substring(5, 7), 16)
        if(isNaN(r) || isNaN(g) || isNaN(b)){
            throw new Error('Invalid hex color code')
        }
        return `${r}, ${g}, ${b}`
    }

};
