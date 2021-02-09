const { PLATFORM_PROD_DIR, PLATFORM_APPS } = require('./config/platform');
const mkdirp = require('mkdirp');

(async () => {

    
    await mkdirp(PLATFORM_PROD_DIR);


})()
.catch(err => {
    console.error(err);
    process.exit(1);
})
.finally(() => process.exit(0));
