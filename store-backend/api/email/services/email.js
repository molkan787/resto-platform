// TEMPORARY SOLUTION
// TODO: create email sending app (separate from store backend app)

const nodemailer = require('nodemailer');

const ACCOUNT = Object.freeze({
    Address: 'noreply@drmapps.eu',
    Password: '6utdPagdxfy901t4PiuR'
})

const transport = nodemailer.createTransport({
    host: 'server343197.nazwa.pl',
    port: 587,
    auth: {
        user: ACCOUNT.Address,
        pass: ACCOUNT.Password
    }
})

module.exports = {

    send(to, subject, content, isHTML){
        return transport.sendMail({
            from: `Murew <${ACCOUNT.Address}>`,
            to: to,
            subject: subject,
            text: isHTML ? undefined : content,
            html: isHTML ? content : undefined,
        })
    }

}