import { InitDatabase, sharedDatabase } from './database.js'
import { log } from 'brolog'
import { asyncPipe, readFile } from './helpers.js'
import { OutputStorage } from './output-storage/output-storage.js'
import { ObjectId } from 'mongodb'
import fs from 'fs'
import path from 'path'

log.level('silly')
const TAG = 'TEST'

async function populateBuildQueue(){
    // const iconFileData = await readFile("C:\\Users\\Seghier\\Downloads\\thumbnail_logo-green-food-label-eco-responsable-2020-ok (1).png")
    const iconFileData = await readFile("C:\\Users\\Seghier\\Desktop\\depositphotos_151060358-stock-illustration-tomato-with-leaves-icon.webp")
    const doc = {
        status: 'queued',
        createAt: new Date('2023-12-18T10:17:33'),
        vendorId: 'VENDOR_600CCRE333',
        packageName: 'com.ketchupcheese.murewmobileclient',
        appDisplayName: 'Ketchup Cheese',
        backendURL: 'http://backend.ketchup-cheese.com',
        iconFileData: iconFileData,
        primaryColor: '235, 94, 52'
    }
    await sharedDatabase.collection('queue_build_mobile_client').insertOne(doc)
}

async function downloadOutputFiles(){
    const bucket = await OutputStorage.getStorageBucket()
    const files = await bucket.find().toArray()
    for(let file of files){
        const { reference } = file.metadata
        const downloadStream = bucket.openDownloadStream(new ObjectId(file._id))
        const writeStream = fs.createWriteStream(path.join("C:\\Users\\Seghier\\Desktop\\apks", reference + '.apk'))
        await asyncPipe(downloadStream, writeStream)
    }
}

async function test(){
    console.log(process.argv)
}

// InitDatabase()
// .then(() => populateBuildQueue())
// .then(() => downloadOutputFiles())
test()
.then(() => {
    console.log('Program completed!')
    process.exit(0)
})
.catch(err => {
    console.error(err)
    console.error('Program errored!')
    process.exit(1)
})