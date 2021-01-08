const fs = require('fs');

function readFile(filename, encoding){
    return new Promise((resolve, reject) => {
        fs.readFile(filename, encoding || 'utf-8', (err, data) => {
            if(err){
                reject(err);
            }else{
                resolve(data);
            }
        });
    })
}

module.exports = { readFile };