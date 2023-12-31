import { addBuildRequest } from './controller.js'
import { InitDatabase } from './database.js'
import { BuildManager } from './manager.js'
import { log } from 'brolog'
import express from 'express'
 
log.level('info')
const TAG = 'INDEX'


async function startApp(){
    const app = express()
    app.use(express.json())

    app.post('/add-build-request', addBuildRequest)

    await new Promise((resolve) => {
        app.listen(1339, resolve)
        log.info('HTTP Server listening on port 1339')
    })
    await BuildManager.start()
}

InitDatabase()
.then(() => {
    log.info('Connected to database')
    return startApp()
})
.catch(err => {
    console.error(err)
    console.error('Program errored!')
    process.exit(1)
})