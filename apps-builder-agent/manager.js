import { ObjectId } from 'mongodb'
import fs from 'fs'
import { DB_QUEUE_BUILD_MOBILE_CLIENT, sharedDatabase } from './database.js'
import { build as buildAndroidMobileStorefront } from './mobile-storefront-android-builder/android-mobile-client-builder.js'
import { build as buildIOSMobileStorefront } from './mobile-storefront-ios-builder/index.js'
import { OutputStorage } from './output-storage/output-storage.js'
import { encodeQueryString, retryAsync, sleep } from './helpers.js'
import { log } from 'brolog'
import { MOBILE_CLIENT_PROJECT_DIR } from './mobile-storefront-android-builder/config.js'
import { CURRENT_AGENT_TYPE, CURRENT_BUILD_APP_TYPE } from './config.js'
import { AGENT_TYPES, BUILD_APP_TYPES } from './types/enums.js'
import axios from 'axios'
import path from 'path'

const TAG = 'BuilderManager'

export class BuildManager{

    static async start(){
        log.info(TAG, 'Started')
        this.cycle()
    }

    static async cycle(){
        while(true){
            const item = await this.consumeQueue(CURRENT_BUILD_APP_TYPE)
            if(item !== null){
                try {
                    await this.performBuild(item)
                    await this.setQueueItemStatus(item._id, 'completed')
                } catch (error) {
                    log.error(TAG, 'Build failed')
                    console.log(error)
                    await this.setQueueItemStatus(item._id, 'errored')
                }
            }else{
                // log.silly(TAG, 'Build queue is empty, Sleeping for 10 seconds')
                await sleep(10 * 1000)
            }
        }
    }
    

    /**
     * @param {import('./types/interfaces.js').BuildQueueItem} payload 
     */
    static async performBuild(payload){
        const { appType, vendorId, packageName, appDisplayName, backendURL, iconFileData, primaryColor } = payload
        log.info(TAG, `Building '${appType}' for VENDOR '${payload.vendorId}'`)
        let outputFilename

        /** @type {import('./types/interfaces.js').BuildPayload & { projectDir: string }} */
        const buildPayload = {
            projectDir: MOBILE_CLIENT_PROJECT_DIR,
            vendorId,
            packageName,
            appDisplayName,
            backendURL,
            iconFileData: iconFileData.buffer,
            primaryColor,
        }
        
        if(appType === BUILD_APP_TYPES.MOBILE_STOREFRONT_ANDROID){
            outputFilename = await buildAndroidMobileStorefront(buildPayload)
        }else if(appType === BUILD_APP_TYPES.MOBILE_STOREFRONT_IOS){
            outputFilename = await buildIOSMobileStorefront(buildPayload)
        }else{
            log.error(TAG, `Unknow build app type "${appType}", canceling build`)
            await this.setQueueItemStatus(payload._id, 'canceled')
            return
        }

        await this.storeBuildOutput({
            appType: appType,
            reference: vendorId,
            filename: outputFilename
        })

        log.info(TAG, `Finished building '${appType}' for VENDOR '${payload.vendorId}'`)
    }

    /**
     * @param {string} appType 
     * @returns {Promise<import('./types/interfaces.js').BuildQueueItem | null>}
     */
    static async consumeQueue(appType){
        if(CURRENT_AGENT_TYPE === AGENT_TYPES.LOCAL){
            return await this.consumeLocalQueue(appType)
        }else if(CURRENT_AGENT_TYPE === AGENT_TYPES.REMOTE){
            return await this.consumeRemoteQueue(appType)
        }else{
            throw new Error('Unknow AGENT_TYPE')
        }
    }

    /**
     * @param {string} appType 
     * @returns {Promise<import('./types/interfaces.js').BuildQueueItem | null>}
     */
    static async consumeLocalQueue(appType){
        const collection = sharedDatabase.collection(DB_QUEUE_BUILD_MOBILE_CLIENT)
        const doc = await collection.findOne(
            { status: 'queued', appType: appType },
            { sort: { createdAt: 'asc' } }
        )
        if(doc){
            await collection.updateOne(
                { _id: new ObjectId(doc._id) },
                {
                    $set: {
                        status: 'building'
                    }
                }
            )
            return doc
        }
        return null
    }

    /**
     * @param {string} appType 
     * @returns {Promise<import('./types/interfaces.js').BuildQueueItem | null>}
     */
    static async consumeRemoteQueue(appType){
        try {
            const { data: { item } } = await axios.get(`/consume-build-request-item/${appType}`)
            if(item){
                item.iconFileData = Buffer.from(item.iconFileData, 'base64')
                return item
            }
        } catch (error) {
        }
        return null
    }

    static async setQueueItemStatus(docId, status){
        if(CURRENT_AGENT_TYPE === AGENT_TYPES.LOCAL){
            return await this.setLocalQueueItemStatus(docId, status)
        }else if(CURRENT_AGENT_TYPE === AGENT_TYPES.REMOTE){
            return await this.setRemoteQueueItemStatus(docId, status)
        }else{
            throw new Error('Unknow AGENT_TYPE')
        }
    }

    static async setLocalQueueItemStatus(docId, status){
        const collection = sharedDatabase.collection(DB_QUEUE_BUILD_MOBILE_CLIENT)
        await collection.updateOne(
            { _id: new ObjectId(docId) },
            {
                $set: {
                    status: status
                }
            }
        )
    }

    static async setRemoteQueueItemStatus(docId, status){
        await retryAsync(() => {
            return axios.post('/set-queue-item-status', {
                itemId: docId,
                status: status,
            })
        }, 3)
    }

    /**
     * @param {{ appType: string, reference: string, filename: string }} payload 
     */
    static async storeBuildOutput(payload){
        if(CURRENT_AGENT_TYPE === AGENT_TYPES.LOCAL){
            return await this.storeLocallyBuildOutput(payload)
        }else if(CURRENT_AGENT_TYPE === AGENT_TYPES.REMOTE){
            return await this.storeRemotelyBuildOutput(payload)
        }else{
            throw new Error('Unknow AGENT_TYPE')
        }
    }

    /**
     * @param {{ appType: string, reference: string, filename: string }} payload 
     */
    static async storeLocallyBuildOutput(payload){
        await retryAsync(() => OutputStorage.put(payload), 3)
    }

    /**
     * @param {{ appType: string, reference: string, filename: string }} payload 
     */
    static async storeRemotelyBuildOutput(payload){
        await retryAsync(async () => {
            const { filename, ..._payload } = payload
            const rs = fs.createReadStream(payload.filename)
            const qs = encodeQueryString({
                ..._payload,
                filename: path.basename(filename)
            })
            await axios.post(`/store-build-output?${qs}`, rs)
        }, 3)
    }

    
    /**
     * @param {Omit<import("./types/interfaces").BuildPayload, 'iconFileData'> & { iconFileData: string }} payload 
     */
    static async addBuildRequest(payload){
        const { appType, vendorId, packageName, appDisplayName, backendURL, iconFileData, primaryColor } = payload
        const collection = sharedDatabase.collection(DB_QUEUE_BUILD_MOBILE_CLIENT)
        await collection.deleteMany({ vendorId })
        await collection.insertOne({
            status: 'queued',
            createdAt: new Date(),
            appType,
            vendorId,
            packageName,
            appDisplayName,
            backendURL,
            iconFileData: Buffer.from(iconFileData, 'base64'),
            primaryColor,
        })
    }
    
}