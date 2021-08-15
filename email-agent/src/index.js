const express = require('express')
const { sendMail } = require('./mailer')
const app = express()
const port = 3033

app.use(express.json()) 

app.post('/sendMail', async (req, res) => {
    const payload = req.body
    try {
        await sendMail(payload)
        res.send('OK')
    } catch (error) {
        console.error(error)
        res.status(500)
        res.send('error')
    }
})

app.listen(port, () => {
    console.log(`Email Agent app listening at http://localhost:${port}`)
})