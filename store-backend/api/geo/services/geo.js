'use strict';

const axios = require('axios');

const DISTANCE_HELPER_URL = process.env.DISTANCE_HELPER_URL || 'http://localhost:1338';

/**
 * `geo` service.
 */

module.exports = {
  getDistanceBetweenPostcodes: async (postcode1, postcode2) => {
    const response = await axios.get(`${DISTANCE_HELPER_URL}/postcodes/distance/${postcode1}/${postcode2}`);
    return response.data;
  }
};
