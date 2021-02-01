const express = require('express');
const postcodesDistance = require('./src/postcodesDistance');

const port = 1338;

(async () => {

    console.time('init');
    await postcodesDistance.init();
    console.timeEnd('init');

    
    const app = express();
    
    app.get('/postcodes/distance/:pc1/:pc2', (req, res) => {
        const distance = postcodesDistance.getDistance(req.params.pc1, req.params.pc2, 'miles');
        res.header('Content-Type', 'application/json');
        res.send({
            distance
        });
    })
    
    app.listen(port, () => {
        console.log(`${require('./package.json').name} app listening at http://localhost:${port}`)
    })

})();
