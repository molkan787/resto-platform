const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend')
const { MAILERSEND_API_KEY, DEFAULT_SENDER_NAME, SENDER_EMAIL_ADDRESS, REPLY_TO_EMAIL_ADDRESS } = require('./config')

const mailerSend = new MailerSend({
    apiKey: MAILERSEND_API_KEY,
})

/**
 * @param {{ to: string, senderName?: string, subject: string, text: string, html?: string }} payload 
 * @returns 
 */
async function sendMail(payload){
    const { to, senderName, subject, text, html } = payload

    const sentFrom = new Sender(SENDER_EMAIL_ADDRESS, senderName || DEFAULT_SENDER_NAME);
    const replyTo = new Sender(REPLY_TO_EMAIL_ADDRESS);
    const recipients = [
        new Recipient(to)
    ]
    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(replyTo)
        .setSubject(subject)
        .setHtml(html)
        .setText(text)

    await mailerSend.email.send(emailParams);
}

module.exports = {
    sendMail
}