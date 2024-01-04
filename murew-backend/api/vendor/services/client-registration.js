'use strict';

/**
 * `client-registration` service.
 */

module.exports = {
  async registerClient(data, { platform_cluster }){
    const { 
      feature_desktop_pos,
      feature_website,
      feature_mobileapp,
      business_name,
      domain_name,
      account_first_name,
      account_last_name,
      account_email,
      account_phone,
      account_password,
    } = data
    const vendorData = {
        Name: business_name,
        domain: domain_name,
        plan_type: 'monthly_fee',
        fee_amount: 0,
        contact_info: {
          first_name: account_first_name,
          last_name: account_last_name,
          email: account_email,
          phone_number: account_phone
        },
        registration_url: '--',
        cluster: platform_cluster,
        features: {
          desktop_pos: feature_desktop_pos,
          website: feature_website,
          mobile_app: feature_mobileapp,
        }
    }
    const userInfo = {
      firstname: account_first_name,
      lastname: account_last_name,
      email: account_email,
      password: account_password
    }
    const vendor = await strapi.query('vendor').create(vendorData)
    console.log('vendor:', vendor)
    await this.createAdminAccount(vendor.id.toString(), userInfo)
    // await this.createAdminAccount('murew-store', userInfo)
    return true
  },
  async createAdminAccount(vendorId, userInfo){
    const isDevVendor = vendorId === 'murew-store';
    const dbName = isDevVendor ? 'murew-store' : `vendor_db_${vendorId}`;
    const client = await strapi.services.shareddb.getMongoClient();
    const db = client.db(dbName);
    // "Store Admin" role has 'strapi-editor' as slug in the database..
    const superAdminRole = await db.collection('strapi_role').findOne({ code: 'strapi-editor' })
    const { firstname, lastname, email, password } = userInfo
    const hashedPassword = await strapi.admin.services.auth.hashPassword(password);
    const accountData = {
      isActive: true,
      blocked: false,
      roles: [superAdminRole._id.toString()],
      username: null,
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: hashedPassword,
    }
    console.log('accountData', accountData)
    await db.collection('strapi_administrator').insert(accountData);
  }
};
