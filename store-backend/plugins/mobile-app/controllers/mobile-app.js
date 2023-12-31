'use strict';

/**
 * mobile-app.js controller
 * @description: A set of functions called "actions" of the `mobile-app` plugin.
 */

module.exports = {

  /**
   * Default action.
   * @return {Promise<void>}
   */

  requestBuild: async (ctx) => {
    await strapi.plugins['mobile-app'].services['mobile-app'].requestMobileAppBuild(ctx.request.body)
    ctx.send({
      status: 'ok',
    })
  },

  getStatus: async (ctx) => {
    const data = await strapi.plugins['mobile-app'].services['mobile-app'].getStatus()
    ctx.send({
      status: 'ok',
      data
    })
  },

  downloadBuildOutput: async (ctx) => {
    const downloadStream = await strapi.plugins['mobile-app'].services['mobile-app'].getBuiltOutput()
    if(downloadStream){
      ctx.response.body = downloadStream
    }else{
      ctx.response.status = 200
      ctx.send('File not found')
    }
  }

};
