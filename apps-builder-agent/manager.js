import { ObjectId } from 'mongodb'
import { DB_QUEUE_BUILD_MOBILE_CLIENT, sharedDatabase } from './database.js'
import { build as buildAndroidMobileClient } from './mobile-client-builder/android-mobile-client-builder.js'
import { OutputStorage } from './output-storage/output-storage.js'
import { sleep } from './helpers.js'
import { log } from 'brolog'
import { MOBILE_CLIENT_PROJECT_DIR } from './mobile-client-builder/config.js'

const TAG = 'BuilderManager'

export const APPS_TYPES = Object.freeze({
    STORE_MOBILE_CLIENT: 'store-mobile-client'
})

export class BuildManager{

    static async start(){
        log.info(TAG, 'Started')
        this.cycle()
    }

    static async cycle(){
        while(true){
            const item = await this.consumeQueue()
            if(item !== null){
                try {
                    await this.performBuild(item)
                    await this.setQueueItemStatus(item._id, 'completed')
                } catch (error) {
                    log.error(TAG, 'Build failed')
                    log.error(TAG, error)
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
        const logText = `Building '${APPS_TYPES.STORE_MOBILE_CLIENT}' for VENDOR '${payload.vendorId}'`
        log.info(TAG, logText + ' STARTED')
        const { vendorId, packageName, appDisplayName, backendURL, iconFileData, primaryColor } = payload
        const outputFilename = await buildAndroidMobileClient({
            projectDir: MOBILE_CLIENT_PROJECT_DIR,
            vendorId,
            packageName,
            appDisplayName,
            backendURL,
            iconFileData: iconFileData.buffer,
            primaryColor,
        })

        await OutputStorage.put({
            appType: 'store-mobile-client',
            reference: payload.vendorId,
            filename: outputFilename
        })
        log.info(TAG, logText + ' COMPLETED')
    }

    /**
     * @returns {Promise<import('./types/interfaces.js').BuildQueueItem | null>}
     */
    static async consumeQueue(){
        const collection = sharedDatabase.collection(DB_QUEUE_BUILD_MOBILE_CLIENT)
        const doc = await collection.findOne(
            { status: 'queued' },
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

    static async setQueueItemStatus(docId, status){
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

    
    /**
     * @param {Omit<import("./types/interfaces").BuildPayload, 'iconFileData'> & { iconFileData: string }} payload 
     */
    static async addBuildRequest(payload){
        const { vendorId, packageName, appDisplayName, backendURL, iconFileData, primaryColor } = payload
        const collection = sharedDatabase.collection(DB_QUEUE_BUILD_MOBILE_CLIENT)
        await collection.deleteMany({ vendorId })
        await collection.insertOne({
            status: 'queued',
            createdAt: new Date(),
            vendorId,
            packageName,
            appDisplayName,
            backendURL,
            iconFileData: Buffer.from(iconFileData, 'base64'),
            primaryColor,
        })
    }
    
}