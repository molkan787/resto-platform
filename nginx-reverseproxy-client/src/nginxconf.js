const { writeFile, exec, isValidURL, readFile } = require("./helpers")
const path = require('path')

const NGINX_SITES_AVAILABLE_DIR = '/etc/nginx/sites-available'
const NGINX_SITES_ENABLED_DIR = '/etc/nginx/sites-enabled'

// const NGINX_SITES_AVAILABLE_DIR = 'C:/test/sites-available'
// const NGINX_SITES_ENABLED_DIR = 'C:/test/sites-enabled'

module.exports = class NginxConf {

    static async addVirtualHost(hostname, targetURL){
        this.validateHostname(hostname)
        this.validateTargetURL(targetURL)
        const confStr = `
        server {
            listen 80;
            listen [::]:80;
            server_name  ${hostname};
    
            location / {
                proxy_pass ${targetURL};
                
                # WebSocket support
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
            }
        }
        `
        const v_filename = `vendor_${hostname}`
        const conf_filename = path.join(NGINX_SITES_AVAILABLE_DIR, v_filename)
        const link_filename = path.join(NGINX_SITES_ENABLED_DIR, v_filename)
        await writeFile(conf_filename, confStr, 'utf8')
        await exec(`ln -s ${conf_filename} ${link_filename}`)
        await this.reloadNginx()
    }

    static async removeVirtualHost(hostname){
        this.validateHostname(hostname)
        const v_filename = `vendor_${hostname}`
        const conf_filename = path.join(NGINX_SITES_AVAILABLE_DIR, v_filename)
        const link_filename = path.join(NGINX_SITES_ENABLED_DIR, v_filename)
        try {
            await exec(`rm ${link_filename}`)
            await exec(`rm ${conf_filename}`)
            await this.reloadNginx()
        } catch (error) {
            console.log(error)
        }
    }

    static async enableVHostHttp2(hostname){
        this.validateHostname(hostname)
        const v_filename = `vendor_${hostname}`
        const conf_filename = path.join(NGINX_SITES_AVAILABLE_DIR, v_filename)
        let confContent = await readFile(conf_filename, 'utf-8')
        confContent = confContent.replace(new RegExp('443 ssl', 'g'), '443 ssl http2')
        await writeFile(conf_filename, confContent, 'utf-8')
    }

    static async reloadNginx(){
        await exec('systemctl reload nginx')
    }

    static validateHostname(hostname){
        const isValid = new RegExp('^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$').test(hostname)
        if(!isValid){
            throw new Error('Invalid hostname')
        }
    }

    static validateTargetURL(targetURL){
        const isValid2 = isValidURL(targetURL)
        if(!isValid2){
            throw new Error('Invalid target URL')
        }
    }

    

}