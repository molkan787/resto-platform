const fs = require('fs')
const { exec: native_exec } = require('child_process')

/**
 * @param {fs.PathLike} filename 
 * @param {string | Buffer} data 
 * @param {BufferEncoding} encoding 
 * @returns {Promise}
 */
module.exports.writeFile = (filename, data, encoding) => new Promise((resolve, reject) => {
    fs.writeFile(filename, data, encoding || null, err => {
        if(err) reject(err);
        else resolve(true);
    })
})

/**
 * @param {fs.PathLike} filename 
 * @param {BufferEncoding} encoding 
 * @returns {Promise}
 */
module.exports.readFile = function readFile(filename, encoding){
    return new Promise((resolve, reject) => {
        fs.readFile(filename, encoding, (err, data) => {
            if(err){
                reject(err);
            }else{
                resolve(data);
            }
        });
    })
}

/**
 * 
 * @param {string} cmd 
 * @param {({ encoding: "buffer" | null; } & import('child_process').ExecOptions)?} options 
 */
module.exports.exec = function (cmd, options) {
    return new Promise((resolve, reject) => {
        const cb = (error, stdout, stderr) => {
            if(error) reject(error);
            else resolve({ stdout, stderr });
        }
        if(options){
            native_exec(cmd, options, cb)
        }else{
            native_exec(cmd, cb)
        }
    })
}


module.exports.isValidURL = function isValidURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }