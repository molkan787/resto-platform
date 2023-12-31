import { routeHandler } from "./helpers.js";
import { BuildManager } from "./manager.js";

export class Controller{


    // addBuildRequest

    /**
     * 
     * @param {{ appType: string, reference: string }} payload 
     */
    static async downloadOutputFile(payload){

    }

}

export const addBuildRequest = (req, res) => routeHandler(
    req, res, () => {
        return BuildManager.addBuildRequest(req.body)
    }
)