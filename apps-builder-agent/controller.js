import { isValidString, routeHandler } from "./helpers.js";
import { BuildManager } from "./manager.js";
import { OutputStorage } from "./output-storage/output-storage.js";

export const addBuildRequest = (req, res) => routeHandler(
    req, res, () => {
        return BuildManager.addBuildRequest(req.body)
    }
)

export const consumeBuildRequestItem = (req, res) => routeHandler(
    req, res, async () => {
        if(!isValidString(req.params.appType)) throw new Error('Bad Request')
        const item = await BuildManager.consumeLocalQueue(req.params.appType)
        if(item){
            item.iconFileData = item.iconFileData.toString('base64')
        }
        return {
            item
        }
    }
)

export const setQueueItemStatus = (req, res) => routeHandler(
    req, res, () => {
        const { itemId, status } = req.body
        if(!isValidString(itemId) || !isValidString(status)) throw new Error('Bad Request')
        return BuildManager.setLocalQueueItemStatus(itemId, status)
    }
)

export const storeBuildOutput = (req, res) => routeHandler(
    req, res, () => {
        const { appType, reference, filename } = req.query
        if(!isValidString(appType) || !isValidString(reference) || !isValidString(filename)) throw new Error('Bad Request')
        return OutputStorage.put({
            appType,
            reference,
            filename,
            fileReadStream: req
        })
    }
)