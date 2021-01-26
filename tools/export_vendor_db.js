const { MongoClient, Db, Collection } = require('mongodb');
const { exec: _exec } = require('child_process');
const path = require('path');
const { DATA_COLLECTIONS } = require('./config');

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

    // Export the database template
    await dumpDatabase(TMP_DB_NAME, OUT_PATH);

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