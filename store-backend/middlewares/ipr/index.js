module.exports = () => {
    return {
        initialize() {
            strapi.router.get('/', (ctx) => {
                ctx.redirect('/admin');
            })
        },
    };
};