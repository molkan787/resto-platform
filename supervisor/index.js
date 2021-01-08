var restify = require('restify');
const { createVendorApp } = require('./controller');

const PORT = process.env.SUPERVISOR_PORT || 8023;
 
const server = restify.createServer({
  name: 'murew-supervisor',
  version: '1.0.0'
});
 
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
 
server.post('/create-vendor-app', createVendorApp);
 
server.listen(PORT, function () {
  console.log('%s listening at %s', server.name, server.url);
});

// const Supervisor = require('./supervisor');
// const supervisor = new Supervisor();
// const ProxyServer = require('./proxyserver');
// const proxyServer = new ProxyServer();

// (async () => {
//     await supervisor.init();
//     await supervisor.createVendorApp({
//         id: 'dc16',
//         domain: 'chocolate.com',
//         port_pointer: 2
//     }, true);
// })();