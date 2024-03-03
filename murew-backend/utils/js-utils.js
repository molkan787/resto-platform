module.exports = {

    /**
     * Checks if the given value is a none empty string and returns it otherwise returns undefined
     * @param {any} value 
     * @returns {string | undefined}
     */
    validStringOrNone(value){
        if(typeof value === 'string' && value.length > 0)
            return value
        else
            return undefined
    }
}