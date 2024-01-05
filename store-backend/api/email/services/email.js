const axios = require('axios')
const isDocker = require('is-docker')

const EMAIL_AGENT_URL = isDocker() ? 'http://emailagent:3033' : 'http://localhost:3033'

module.exports = {

    async send(to, subject, content, isHTML){
        const vendorName = await strapi.services.shared.getVendorName()
        const msg = {
            to,
            subject,
            text: isHTML ? '' : content,
            html: isHTML ? content : content.replace(/\n/g, '<br>'),
            senderName: vendorName,
        }
        return await axios.post(`${EMAIL_AGENT_URL}/sendMail`, msg)
    }

}