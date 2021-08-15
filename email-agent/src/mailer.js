const sgMail = require('@sendgrid/mail')
const { SENDGRID_API_KEY } = require('./config')

sgMail.setApiKey(SENDGRID_API_KEY)

/**
 * 
 * @param {{ to: string, senderName?: string, subject: string, text: string, html?: string }} payload 
 * @returns 
 */
function sendMail(payload){
    const { to, senderName, subject, text, html } = payload
    const msg = {
        to,
        from: `${senderName || 'Murew'} <noreply@supermarketonline.co.uk>`,
        subject,
        text,
        html
    }
    return sgMail.send(msg)
}

module.exports = {
    sendMail
}