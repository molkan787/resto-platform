module.exports = ({ env }) => {
    const conf = {
        VENDOR_ID: env('VENDOR_ID', '65a4fae3d8cd667865e3ce38'),
    }
    console.log('config.vendor:', conf)
    return conf
}
  