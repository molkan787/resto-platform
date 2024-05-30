'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async custom_css(ctx){
        const css_content = await strapi.services['theme-settings'].getCustomCSSContent()
        ctx.set('Content-Type', 'text/css')
        return css_content
    }
};
