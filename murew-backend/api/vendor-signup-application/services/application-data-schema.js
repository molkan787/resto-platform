const Joi = require('joi')

const ApplicationDataSchema = Joi.object({
    feature_desktop_pos: Joi.bool().required(),
    feature_website: Joi.bool().required(),
    feature_mobileapp: Joi.bool().required(),
    business_name: Joi.string().required().min(2).max(100).label('Business Name'),
    domain_name: Joi.string().domain().label('Domain Name'),
    account_first_name: Joi.string().required().label('First Name'),
    account_last_name: Joi.string().required().label('Last Name'),
    account_email: Joi.string().email().required().label('Email Addresss'),
    account_phone: Joi.string().pattern(/^\d+$/).min(8).max(14).required().label('Phone Number'),
    account_password: Joi.string().min(8).max(80).required().label('Password'),
})

module.exports = {
    validateApplicationData(data){
        return ApplicationDataSchema.validate(data)
    }
}