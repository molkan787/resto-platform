var restify = require('restify');
const { createVendorApp, destroyVendorApp, updateVendorApp } = require('./controller');

const PORT = process.env.SUPERVISOR_PORT || 1323;
 
const server = restify.createServer({
  name: 'murew-supervisor',
  version: '1.0.0'
});
 
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
 
server.post('/create-vendor-app', createVendorApp);
server.post('/destroy-vendor-app', destroyVendorApp);
server.post('/update-vendor-app', updateVendorApp);
 
server.listen(PORT, function () {
  console.log('%s listening at %s', server.name, server.url);
});
