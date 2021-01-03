const { auth } = require('strapi-helper-plugin');
module.exports = function request(...args) {
    let [url, options = {}, shouldWatchServerRestart, stringify = true, ...rest] = args;
    let noAuth;

    try {
        [{ noAuth }] = rest;
    } catch (err) {
        noAuth = false;
    }

    // Set headers
    if (!options.headers) {
        options.headers = Object.assign(
            {
                'Content-Type': 'application/json',
            },
            options.headers
        );
    }

    const token = auth.getToken();

    if (token && !noAuth) {
        options.headers = Object.assign(
            {
                Authorization: `Bearer ${token}`,
            },
            options.headers
        );
    }

    // Add parameters to url
    url = _.startsWith(url, '/') ? `${strapi.backendURL}${url}` : url;

    if (options && options.params) {
        const params = formatQueryParams(options.params);
        url = `${url}?${params}`;
    }

    // Stringify body object
    if (options && options.body && stringify) {
        options.body = JSON.stringify(options.body);
    }

    return fetch(url, options);
}

/**
 * Format query params
 *
 * @param params
 * @returns {string}
 */
function formatQueryParams(params) {
    return Object.keys(params)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');
}