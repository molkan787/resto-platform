const { MongoClient, Db, Collection, ObjectID } = require('mongodb');
const { exec: _exec } = require('child_process');
const path = require('path');
const { DATA_COLLECTIONS, SUPER_ADMIN_ROLE_CODE, EDITOR_ROLE_CODE } = require('./config/config');

const BIN_MONGODUMP = 'C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongodump.exe';
const BIN_MONGORESTORE = 'C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongorestore.exe';
const DB_BASE_URI = 'mongodb://localhost:27017/';
const SRC_DB_NAME = 'murew-store';
const TMP_DB_NAME = 'murew-store-tmp';

(async () => {

    const OUT_PATH = path.resolve('../supervisor/vendor_db');

    const client = await MongoClient.connect(DB_BASE_URI);
    const tmpDb = client.db(TMP_DB_NAME);

    // Delete the temporary database, in case it exists
    await tmpDb.dropDatabase();

    // Clone the dev/testing database
    await cloneDatabase(SRC_DB_NAME, TMP_DB_NAME);

    // Clear test data
    await clearCollections(tmpDb, DATA_COLLECTIONS);

    // Set the default values
    await populateDefaultData(tmpDb);

    // Export the database template
    await dumpDatabase(TMP_DB_NAME, OUT_PATH);

    // Delete the temporary database
    await tmpDb.dropDatabase();

    console.log(`Database template exported to "${OUT_PATH}"`);

})()
.catch(err => {
    console.error(err);
    process.exit(1);
})
.finally(() => process.exit(0));

/**
 * @param {Db} db 
 */
async function populateDefaultData(db){
    const storesColl = db.collection('stores');
    await storesColl.insertOne({
        _id: new ObjectID('611a4dc0d2ad725168e343e7'),
        active: true,
        name: 'Main',
        address: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: 'main',
        menu_sync_enabled: false,
        opening_hours: [{
            _id: new ObjectID('60674a4b12ad47296c14a3cb'),
            kind: 'ComponentCommonWeekTiming',
            ref: new ObjectID('6040d8c7f1b8f901bcae307b'),
        }]
    });
    const metadataColl = db.collection('metadata');
    await metadataColl.updateOne({}, { 
        $set: {
            order_no_pointer: 1,
            booking_no_pointer: 1
        }
    });
    const layoutSettingsColl = db.collection('layout_settings');
    await layoutSettingsColl.updateOne({}, {
        $set: {
            order_page_layout: 'tabs',
            primary_color: '{"hex":"#695028ff","rgb":{"r":105,"g":80,"b":40,"a":1},"css":"rgba(105,80,40,1)"}',
        }
    });
    const adminsColl = db.collection('strapi_administrator');
    await adminsColl.deleteMany({
        email: { $nin: ['worw787@gmail.com', 'platform@muerw.xyz'] }
    });
    const vendorMetasColl = db.collection('vendor_metas');
    await vendorMetasColl.deleteMany({});
    await vendorMetasColl.insertOne({
        stripe_connected_account_id: null,
        stripe_connected_account_email: null,
        stripe_connected_account_ready: false
    })
}

/**
 * @param {Db} db 
 * @param {Collection} collections 
 */
async function clearCollections(db, collections){
    return Promise.all(
        collections.map(coll => db.collection(coll).deleteMany({}))
    )
}

async function dumpDatabase(dbName, outputPath){
    await exec(`"${BIN_MONGODUMP}" --uri="${DB_BASE_URI}${dbName}" --archive="${outputPath}"`);
}

async function restoreDatabase(dbName, archivePath){
    await exec(`"${BIN_MONGORESTORE} --archive="${archivePath}"`);
}

async function cloneDatabase(sourceName, targetName){
    await exec(`"${BIN_MONGODUMP}" --archive --db="${sourceName}" --uri="${DB_BASE_URI}" | "${BIN_MONGORESTORE}" --archive --nsFrom="${sourceName}.*" --nsTo="${targetName}.*" --uri="${DB_BASE_URI}"`);
}


function exec(cmd){
    return new Promise((resolve, reject) => {
        _exec(cmd, (err, stdout, stderr) => {
            if(err){
                reject(err);
            }else{
                resolve(stdout);
            }
        });
    });
}