'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async auth(ctx){
        const { token } = ctx.params;
        const data = await strapi.services['direct-auth-token'].auth(token);
        if(data){
            return `
                <html>
                    <script>
                        window.localStorage.setItem('jwtToken', '${JSON.stringify(data.jwtToken)}');
                        window.localStorage.setItem('userInfo', '${JSON.stringify(data.userInfo)}');
                        window.location.href = '/admin';
                    </script>
                    <body>
                        <p>Authenticating, please wait...</p>
                    </body>
                </html>
            `;
        }else{
            return `
                <html>
                    <body>
                        <p>An error occured</p>
                    </body>
                </html>
            `;
        }
    }

};
