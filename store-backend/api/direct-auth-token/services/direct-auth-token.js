'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

const { sanitizeEntity } = require('strapi-utils');

module.exports = {

    async auth(token){
        const atoken = await strapi.query('direct-auth-token').findOne({ token: token });
        if(!atoken) return null;
        const { id, createdAt, user_email } = atoken;
        await strapi.query('direct-auth-token').delete({ id: id });
        if(new Date() - new Date(createdAt) > 1000 * 60 * 60){ // token expire after 1 Hour
            return null;
        }
        const userQuery = strapi.query('user', 'admin');
        const user = await userQuery.findOne({ email: user_email });
        if(!user) return null;
        const jwtToken = strapi.admin.services.token.createJwtToken(user);
        return {
            jwtToken: jwtToken,
            userInfo: sanitizeEntity(user, { model: userQuery.model })
        };
    }

};
