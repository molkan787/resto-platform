const env = (n, v) => process.env[n] || v

module.exports = {
    MAILERSEND_API_KEY: env('MAILERSEND_API_KEY', 'mlsn.0cef6917b12f0354e67dec5c94e51d86bb91fb2653a1fe60a75eb0244666e2d7'),
    DEFAULT_SENDER_NAME: env('DEFAULT_SENDER_NAME', 'uJustEat'),
    SENDER_EMAIL_ADDRESS: env('SENDER_EMAIL_ADDRESS', 'noreply@ujusteat.com'),
    REPLY_TO_EMAIL_ADDRESS: env('REPLY_TO_EMAIL_ADDRESS', 'contact@ujusteat.com'),
}