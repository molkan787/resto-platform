function randomString(length) {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function sleep(timeInMS){
    return new Promise(r => setTimeout(r, timeInMS))
}

module.exports = {
    randomString,
    sleep,
}