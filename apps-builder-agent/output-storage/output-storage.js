import MongoDB from 'mongodb'
import fs from 'fs'
import path from 'path'
import { asyncPipe } from '../helpers.js'
import { sharedDatabase } from '../database.js'
import { Readable } from 'stream'

const { GridFSBucket, ObjectId } = MongoDB

export class OutputStorage{

    /**
     * @typedef PutPayload
     * @property {string} appType
     * @property {string} reference
     * @property {string} filename
     * @property {Readable?} fileReadStream
     * 
     * @param {PutPayload} payload 
     */
    static async put(payload){
        const { appType, reference, filename, fileReadStream } = payload
        const bucket = await this.getStorageBucket()
        const _files = await bucket.find({
            metadata: {
                appType,
                reference
            }
        }).toArray()
        await Promise.all(_files.map(f => bucket.delete(new ObjectId(f._id))))
        const readStream = fileReadStream || fs.createReadStream(filename)
        const uploadStream = bucket.openUploadStream(
            path.basename(filename),
            { metadata: { appType, reference } }
        )
        await asyncPipe(readStream, uploadStream)
    }

    static async getStorageBucket(){
        const bucket = new GridFSBucket(sharedDatabase, { bucketName: 'build_outputs' })
        return bucket
    }

}