const env = (n, v) => process.env[n] || v

module.exports = {
    SENDGRID_API_KEY: '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',
    DEFAULT_SENDER_NAME: env('DEFAULT_SENDER_NAME', 'Murew'),
    SENDER_EMAIL_ADDRESS: env('SENDER_EMAIL_ADDRESS', 'noreply@murew.com'),
}