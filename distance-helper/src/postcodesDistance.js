const { loadPostcodes } = require('./resources');

module.exports = class PostcodesDistance{

    static async init() {
        const postcodes = await loadPostcodes();
        const ps = this.positions = new Map();
        const len = postcodes.length;
        for(let i = 0; i < len; i++){
            const { postcode, latitude, longitude } = postcodes[i];
            const key = postcode.replace(/\s/g, '');
            ps.set(key, {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            });
        }
    }

    static getDistance(postcode1, postcode2, unit){
        postcode1 = postcode1.replace(/\s/g, '');
        postcode2 = postcode2.replace(/\s/g, '');
        const position1 = this.positions.get(postcode1);
        const position2 = this.positions.get(postcode2);
        if(!position1 || !position2){
            return null;
        }
        return this.calcDistance(position1, position2, unit);
    }

    static calcDistance(position1, position2, unit){
        const lon1 = degrees_to_radians(position1.longitude);
        const lon2 = degrees_to_radians(position2.longitude);
        const lat1 = degrees_to_radians(position1.latitude);
        const lat2 = degrees_to_radians(position2.latitude);

        const dlon = lon2 - lon1;  
        const dlat = lat2 - lat1; 
        const a = Math.pow(Math.sin(dlat / 2), 2) 
                  + Math.cos(lat1) * Math.cos(lat2) 
                  * Math.pow(Math.sin(dlon / 2),2); 
        const r = unit == 'miles' ? 3956 : 6371;
        const c = 2 * Math.asin(Math.sqrt(a));
        return c * r;
    }

}

function degrees_to_radians(degrees){
  return degrees * (Math.PI / 180);
}