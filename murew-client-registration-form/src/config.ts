const isDev = process.env.NODE_ENV == 'development'

export const Config = Object.freeze({
    API_URL: isDev ? 'http://localhost:1337' : 'https://platform.ujusteat.com'
})
