'use strict';

/**
 * platform-features.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

module.exports = {
    async getFeatures(){
        const { features } = await strapi.services.shared.getVendorPlan()
        return features
    },
    async getDetailedFeatures(){
        const features = await this.getFeatures()
        features.website = assignFeatureProps(
            features.website,
            { url: strapi.config.app.frontendURL }
        )
        return features
    }
};

function assignFeatureProps(item, props){
    if(item === true){
        return cloneObject(props)
    }else if(typeof item === 'object' && item !== null){
        return Object.assign(item, cloneObject(props))
    }else{
        return false
    }
}

function cloneObject(obj){
    return JSON.parse(JSON.stringify(obj))
}