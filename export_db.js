const MongoClient = require('./supervisor/node_modules/mongodb').MongoClient;
const fs = require('fs');

const DB_NAME = 'murew-store';

(async () => {

    const client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db(DB_NAME);
    const collectionNames = await getCollectionNames(db);
    const queries = collectionNames.map(cn => getCollectionData(db, cn));
    const collectionsData = await Promise.all(queries);
    const strData = JSON.stringify(collectionsData);
    await writeFile('./db.json', strData, 'utf-8');

    process.exit(0);

})();

async function getCollectionData(db, collectionName){
    const docs = await getCollectionDocuments(db, collectionName);
    return {
        collectionName,
        docs: docs
    }
}

async function getCollectionNames(db){
    const subLen = DB_NAME.length + 1;
    const collections = await db.collections();
    return collections.map(c => c.namespace.substr(subLen));
}

function getCollectionDocuments(db, collectionName){
    return new Promise((resolve, reject) => {
        const docs = [];
        const collection = db.collection(collectionName)
        const cursor = collection.find({});
        cursor.on('data', doc => docs.push(doc));
        cursor.on('end', () => resolve(docs));
        cursor.on('error', reject);
    })
}

function writeFile(filename, data, encoding){
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, encoding, err => {
            err ? reject(err) : resolve();
        });
    })
}