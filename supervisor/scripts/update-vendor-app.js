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
    console.log(`Updating vendor "${vendorDoc.Name}" with domain "${vendorDoc.domain}"`)
    await sleep(10000) // Giving time to user to cancel the operation if needed
    await axios.post('http://127.0.0.1:1323/update-vendor-app', { app: vendorDoc })
    console.log('Successfully updated vendor app!')
}

run()
.then(() => process.exit(0))
.catch(err => {
    console.error(err)
    process.exit(1)
})