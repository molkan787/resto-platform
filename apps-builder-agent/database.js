import MongoDB from 'mongodb'

const { MongoClient } = MongoDB

const MongoDbURI = process.env.DATABASE_URI || 'mongodb://localhost:27017'
const MASTER_BACKEND_DB_NAME = process.env.MASTER_BACKEND_DB_NAME || 'murew'

/** @type {MongoDB.Db} */
export let sharedDatabase = null

/** @type {MongoDB.Db} */
export let platformDatabase = null

/** @type {MongoDB.Collection} */
export let settingsCollection = null

export async function InitDatabase(){
    const client = new MongoClient(MongoDbURI)
    await client.connect()
    sharedDatabase = client.db('murew-shared')
    platformDatabase = client.db(MASTER_BACKEND_DB_NAME)
    settingsCollection = platformDatabase.collection('apps_builder_settings')
}

export const DB_QUEUE_BUILD_MOBILE_CLIENT = 'queue_build_mobile_client'