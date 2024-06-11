const axios = require('axios')
const { MongoClient, ObjectId } = require('mongodb');
const { DATABASE_URI, MASTER_BACKEND_DB_NAME } = require('../config');
const { sleep } = require('../utils');

async function run(){
    const vendorId = process.argv[2]
    if(!vendorId) throw new Error('argument vendorId is missing. ')
    const mongoClient = await MongoClient.connect(DATABASE_URI, { useUnifiedTopology: true });
    const db = mongoClient.db(MASTER_BACKEND_DB_NAME);
    const vendorDoc = await db.collection('vendors').findOne({ _id: ObjectId(vendorId) })
    await fillComponentsData(db, vendorDoc)
    vendorDoc.id = vendorDoc._id.toString()
    if(process.env.LOG_LEVEL === 'verbose'){
        console.log('vendorDoc:', vendorDoc)
    }
    console.log(`Updating vendor "${vendorDoc.Name}" with domain "${vendorDoc.domain}"`)
    console.log('Waiting 10 seconds before proceeding...')
    await sleep(10000) // Giving time to user to cancel the operation if needed
    await axios.post('http://127.0.0.1:1323/update-vendor-app', { app: vendorDoc })
    console.log('Successfully updated vendor app!')
}

async function fillComponentsData(db, vendorDoc){
    const featuresComp = (vendorDoc.features || [])[0] || {}
    if(featuresComp.kind === 'ComponentDivertPlatformFeatures'){
        const coll = db.collection('components_divert_platform_features')
        const fcDoc = await coll.findOne({ _id: ObjectId(featuresComp.ref) })
        if(typeof fcDoc === 'object' && fcDoc !== null){
            vendorDoc.features = fcDoc
        }
    }
}

run()
.then(() => process.exit(0))
.catch(err => {
    console.error(err)
    process.exit(1)
})