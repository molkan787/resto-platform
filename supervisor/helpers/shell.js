const child_process = require('child_process');

/**
 * 
 * @param {string} cmd 
 * @returns {Promise<{ stdout: string, stderr: string }>}
 */
function exec(cmd){
    return new Promise((resolve, reject) => {
        child_process.exec(cmd, (error, stdout, stderr) => {
            if(error) reject(error)
            else resolve({ stdout, stderr })
        });
    });
}

module.exports = { exec };