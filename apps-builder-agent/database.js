import MongoDB from 'mongodb'

const { MongoClient, Db } = MongoDB

const MongoDbURI = process.env.DATABASE_URI || 'mongodb://localhost:27017'

/** @type {MongoDB.Db} */
export let sharedDatabase = null

export async function InitDatabase(){
    const client = new MongoClient(MongoDbURI)
    await client.connect()
    sharedDatabase = client.db('murew-shared')
}

export const DB_QUEUE_BUILD_MOBILE_CLIENT = 'queue_build_mobile_client'