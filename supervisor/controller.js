const errors = require('restify-errors');
const Supervisor = require('./supervisor');
const supervisor = new Supervisor();
supervisor.init();

async function createVendorApp(req, res, next){
    const { app } = req.body;
    if(typeof app != 'object'){
        return next(new errors.BadRequestError('Missing app data'));
    }
    try {
        const data = await supervisor.createVendorApp(app, false);
        res.status(201);
        res.send(data);
    } catch (error) {
        console.error(error);
        return next(new errors.InternalError());
    }
    return next();
}

async function destroyVendorApp(req, res, next){
    const { app } = req.body;
    if(typeof app != 'object'){
        return next(new errors.BadRequestError('Missing app data'));
    }
    try {
        await supervisor.destroyVendorApp(app);
    } catch (error) {
        console.error(error);
        return next(new errors.InternalError());
    }
    res.status(200);
    res.send({});
    return next();
}

module.exports = { createVendorApp, destroyVendorApp };