const { sendMail } = require('./src/mailer.js')

sendMail({
    to: 'molkan787@outlook.com',
    subject: 'Test Transactional Email',
    text: 'Test email content, Seems like it\'s working!'
})
.then(() => console.log('Program Completed!'))
.catch(err => {
    console.error(err)
    process.exit(1)
})