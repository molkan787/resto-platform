const axios = require('axios')

const EMAIL_AGENT_URL = process.env.NODE_ENV == 'development' ? 'http://localhost:3033' : 'http://emailagent:3033'

module.exports = {

    send(to, subject, content, isHTML){
        const msg = {
            to,
            subject,
            text: isHTML ? '' : content,
            html: isHTML ? content : content.replace(/\n/g, '<br>'),
            senderName: 'Murew',
        }
        return axios.post(`${EMAIL_AGENT_URL}/sendMail`, msg)
    }

}