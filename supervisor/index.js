// var restify = require('restify');

// const PORT = process.env.port || 8023;
 
// const server = restify.createServer({
//   name: 'murew-supervisor',
//   version: '1.0.0'
// });
 
// server.use(restify.plugins.acceptParser(server.acceptable));
// server.use(restify.plugins.queryParser());
// server.use(restify.plugins.bodyParser());
 
// server.get('/echo/:name', function (req, res, next) {
//   res.send(req.params);
//   return next();
// });
 
// server.listen(PORT, function () {
//   console.log('%s listening at %s', server.name, server.url);
// });

const Supervisor = require('./supervisor');
const supervisor = new Supervisor();

(async () => {
    await supervisor.init();
    await supervisor.createVendorApp('ac45', { frontend: 81, backend: 1337 });
})();