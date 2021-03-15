module.exports = class Time{

    static now(){
        return Math.floor(Date.now() / 1000);
    }

}