const { sanitizeEntity } = require('strapi-utils');

module.exports = {
    async updateMe(ctx){
        const user = ctx.state.user;
        const { fullname, phone, default_address } = ctx.request.body;
        const data = { fullname, phone, default_address };
        const updatedUser = await strapi.services.account.updateUser(user, data);
        return sanitizeEntity(updatedUser, { model: strapi.query('user', 'users-permissions').model });
    }
}