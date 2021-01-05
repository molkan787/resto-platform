const Docker = require('dockerode');

const options = process.platform == 'win32' ? ({
    protocol: 'http',
    port: 2375
}) : ({socketPath: '/var/run/docker.sock'});

module.exports = new Docker(options);