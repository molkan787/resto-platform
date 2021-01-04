module.exports = {
    async updateUser(user, data){
        return await strapi.query('user', 'users-permissions').update({
            id: user.id
        }, data);
    }
}