module.exports = strapi => {
    return {
        initialize() {
            strapi.app.use(async (ctx, next) => {
                try {
                    await next();
                } catch (error) {
                    if(error.isHttpError){
                        ctx.response.status = error.statusCode;
                        ctx.response.message = error.message;
                    }else{
                        throw error;
                    }
                }
            });
        },
    };
};