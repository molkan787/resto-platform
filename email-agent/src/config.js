const env = (n, v) => process.env[n] || v

module.exports = {
    MAILERSEND_API_KEY: env('MAILERSEND_API_KEY', 'xxxxxxxxxxxxxxxxxx'),
    DEFAULT_SENDER_NAME: env('DEFAULT_SENDER_NAME', 'uJustEat'),
    SENDER_EMAIL_ADDRESS: env('SENDER_EMAIL_ADDRESS', 'noreply@ujusteat.com'),
    REPLY_TO_EMAIL_ADDRESS: env('REPLY_TO_EMAIL_ADDRESS', 'contact@ujusteat.com'),
}