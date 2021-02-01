function loadPostcodes(){
    return new Promise((resolve, reject) => {
        const csv = require('csv-parser')
        const fs = require('fs')
        const results = [];
        
        fs.createReadStream('./resources/ukpostcodes.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            resolve(results);
        })
        .on('error', reject)
    });
}

module.exports = { loadPostcodes };