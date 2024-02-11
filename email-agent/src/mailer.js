const sgMail = require('@sendgrid/mail')
const { SENDGRID_API_KEY, DEFAULT_SENDER_NAME, SENDER_EMAIL_ADDRESS } = require('./config')

sgMail.setApiKey(SENDGRID_API_KEY)

/**
 * @param {{ to: string, senderName?: string, subject: string, text: string, html?: string }} payload 
 * @returns 
 */
function sendMail(payload){
    const { to, senderName, subject, text, html } = payload
    const msg = {
        to,
        from: `${senderName || DEFAULT_SENDER_NAME} <${SENDER_EMAIL_ADDRESS}>`,
        subject,
        text,
        html
    }
    return sgMail.send(msg)
}

module.exports = {
    sendMail
}