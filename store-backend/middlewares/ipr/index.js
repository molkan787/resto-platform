module.exports = () => {
    return {
        initialize() {
            strapi.router.get('/', (ctx) => {
                ctx.redirect('/admin');
            });
            strapi.app.use(async (ctx, next) => {
                await next();
                ctx.set('X-Frame-Options', null);
            });
        },
    };
};