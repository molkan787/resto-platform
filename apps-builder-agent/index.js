import { CURRENT_AGENT_TYPE } from './config.js'
import { addBuildRequest, consumeBuildRequestItem, setQueueItemStatus, storeBuildOutput } from './controller.js'
import { InitDatabase } from './database.js'
import { BuildManager } from './manager.js'
import { log } from 'brolog'
import express from 'express'
import { AGENT_TYPES } from './types/enums.js'
 
log.level('verbose')
const TAG = 'INDEX'


async function startApp(){
    if(CURRENT_AGENT_TYPE === AGENT_TYPES.LOCAL){
        await InitDatabase()
        log.info('Connected to database')

        const app = express()
        app.use(express.json())

        app.post('/add-build-request', addBuildRequest)
        app.get('/consume-build-request-item/:appType', consumeBuildRequestItem)
        app.post('/store-build-output', storeBuildOutput)
        app.post('/set-queue-item-status', setQueueItemStatus)

        await new Promise((resolve) => {
            app.listen(1339, resolve)
            log.info('HTTP Server listening on port 1339')
        })
    }
    await BuildManager.start()
}

startApp()
.catch(err => {
    console.error(err)
    console.error('Program errored!')
    process.exit(1)
})