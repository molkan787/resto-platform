const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017'
const MASTER_BACKEND_DB_NAME = process.env.MASTER_BACKEND_DB_NAME || 'murew'

module.exports = {
    DATABASE_URI,
    MASTER_BACKEND_DB_NAME
}