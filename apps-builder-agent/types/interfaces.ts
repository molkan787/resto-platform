import { ObjectId } from "mongodb"

export interface BuildPayload{
    appType: string
    vendorId: string
    packageName: string
    appDisplayName: string
    backendURL: string
    iconFileData: Buffer
    /** Must match the following format "r,g,b" */
    primaryColor: string
}

export interface BuildQueueItem extends BuildPayload{
    _id: ObjectId
    status: string
}