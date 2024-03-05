import axios from "axios";
import { AGENT_TYPES, BUILD_APP_TYPES } from "./types/enums.js";

export const CURRENT_AGENT_TYPE = process.env.AGENT_TYPE || AGENT_TYPES.LOCAL

export const CURRENT_BUILD_APP_TYPE = process.env.BUILD_APP_TYPE || BUILD_APP_TYPES.MOBILE_STOREFRONT_ANDROID

export const REMOTE_AGENT_URL = process.env.REMOTE_AGENT_URL || 'http://localhost:1339'

console.log('=================== CONFIG PROPERTIES ===================')
console.table([
    { key: 'CURRENT_AGENT_TYPE', value: CURRENT_AGENT_TYPE },
    { key: 'CURRENT_BUILD_APP_TYPE', value: CURRENT_BUILD_APP_TYPE },
    { key: 'REMOTE_AGENT_URL', value: REMOTE_AGENT_URL },
])
console.log('=========================================================')

if(!Object.values(AGENT_TYPES).includes(CURRENT_AGENT_TYPE)){
    log.error(`Unknow AGENT_TYPE "${CURRENT_AGENT_TYPE}", quiting..`)
    process.exit(1)
}

if(!Object.values(BUILD_APP_TYPES).includes(CURRENT_BUILD_APP_TYPE)){
    log.error(`Unknow BUILD_APP_TYPE "${CURRENT_BUILD_APP_TYPE}", quiting..`)
    process.exit(1)
}

axios.defaults.baseURL = REMOTE_AGENT_URL