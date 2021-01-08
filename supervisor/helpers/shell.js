const child_process = require('child_process');

function exec(cmd){
    return new Promise((resolve, reject) => {
        const child = child_process.exec(cmd);
        child.on('error', reject);
        child.on('exit', resolve);
    });
}

module.exports = { exec };