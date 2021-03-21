'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async test(ctx){
        const service = strapi.services['platform-fees'];
        const fee = await service.getPlatformFeeAmount({ amount: 3760 });
        ctx.send({ fee })
    }

};
