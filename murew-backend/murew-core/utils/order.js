module.exports.generateOrderNumber = function(pointer, domain){
    return `${domain}${prependZeros(pointer, 4)}`
}

function prependZeros(num, minLength){
    const str = num.toString();
    const pc = Math.max(minLength - str.length, 0);
    return '0'.repeat(pc) + str;
}