<script setup lang="ts">
import { computed, ref } from 'vue';
import InputField from './components/base/InputField.vue';
import { Config, isDev } from './config'
import { getQueryVariable } from './helpers'

const step = ref(-1)
const loadingText = ref('Loading...')
const previousStep = () => step.value--;
const nextStep = () => {
  if (!validateInput()) {
    showErrors.value = true
    return
  }
  showErrors.value = false
  if (currentStepIs(STEP_features)) {
    loadPaymentModels()
  } else if (currentStepIs(STEP_admin_account_info)) {
    submitApplication()
  } else if (currentStepIs(STEP_payment_info)) {
    submitStripePayment()
  } else if (currentStepIs(STEP_awaiting_dns)) {
    checkDomainConfiguration()
  } else {
    step.value++;
  }
}

function validateInput() {
  // return true
  const s = step.value
  if (currentStepIs(STEP_features)) {
    if (data.value.feature_website === false && data.value.feature_mobileapp === false) {
      alert('Atleast one of the following features must be selected:\n- Website\n- Mobile App')
      return false
    }
  } else if (currentStepIs(STEP_payment_model)) {
    const valid = !!data.value.payment_model
    if (!valid) {
      alert('Please select a payment model.')
    }
    return valid
  } else if (currentStepIs(STEP_business_info)) {
    return validateProps(['business_name', 'domain_name'])
  } else if (currentStepIs(STEP_admin_account_info)) {
    const matches = data.value.account_password === data.value.account_repeat_password
    passwordsError.value = !matches
    return (
      validateProps(['account_first_name', 'account_last_name', 'account_email', 'account_password', 'account_repeat_password'])
      && matches
    )
  }
  return true
}
function validateProps(props: (keyof typeof data.value)[]) {
  for (let p of props) {
    if ((data.value[p] ?? '').toString().trim().length === 0) {
      return false
    }
  }
  return true
}

const showErrors = ref(false)
const passwordsError = ref(false)

const currentApplicationId = ref('')
const data = ref({
  feature_desktop_pos: true,
  feature_website: true,
  feature_mobileapp: true,
  business_name: '',
  domain_name: '',
  payment_model: '',
  account_first_name: '',
  account_last_name: '',
  account_email: '',
  account_phone: '',
  account_password: '',
  account_repeat_password: ''
})
const web_data = ref({
  domain_name: 'restaurant.com',
  serverIP: '1.1.1.1'
})

async function submitApplication() {
  try {
    loadingText.value = 'Please wait...'
    const payload = <any>Object.assign({}, data.value)
    delete payload.account_repeat_password
    const response = await fetch(
      `${Config.API_URL}/vendor-signup-applications/create-application`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )
    if (response.status !== 200) throw new Error(response.statusText)
    const { error, id } = await response.json()
    if (error) {
      if (typeof error === 'string') {
        alert(error)
      } else {
        alert(error.details[0].message)
      }
    } else {
      setApplicationId(id)
    }
  } catch (error) {
    console.error(error)
    alert('An error occured, Please try again.')
  }
  loadingText.value = ''
}

function setApplicationId(id: string) {
  window.top?.postMessage({ applicationId: id })

  // For development only
  try {
    if(window.self === window.top){
      const search = (window.location.search.length > 0 ? '&' : '?') + `aid=${id}`
      window.location.replace(window.location.href + search)
    }
  } catch (error) {
    
  }
}

async function checkDomainConfiguration() {
  try {
    loadingText.value = 'Checking your domain configuration...'
    const response = await fetch(`${Config.API_URL}/vendor-signup-applications/verify-dns/${currentApplicationId.value}`, { method: 'POST' })
    if (response.status !== 200) throw new Error(response.statusText)
    const { status: applicationStatus } = await response.json()
    if (applicationStatus === 'awaiting_dns') {
      alert('Your domain is not pointing to the specified ip address, If you already made changes to the dns wait a few minutes and click "Verify" button again.')
    } else {
      setStepByName(applicationStatus)
    }
  } catch (error) {
    console.error(error)
    alert('An error occured, Please try again.')
  }
  loadingText.value = ''
}

const applicationDoc = ref<Record<string, any> | undefined>()
const currentPaymentModel = computed(() => applicationDoc.value?.payment_model)

async function loadApplication(applicationId: string) {
  try {
    const response = await fetch(`${Config.API_URL}/vendor-signup-applications/application-data/${applicationId}`)
    const responseData = await response.json()
    applicationDoc.value = responseData
    const { status, data: applicationData, cluster } = responseData
    Object.assign(data.value, applicationData)
    web_data.value.domain_name = applicationData.domain_name
    web_data.value.serverIP = cluster.public_ip
    currentApplicationId.value = applicationId
    setStepByName(status)
  } catch (error) {
    console.error(error)
    alert('An error occured, Please contact support.')
  }
  loadingText.value = ''
}

const STEP_features = 'features'
const STEP_payment_model = 'payment_model'
const STEP_business_info = 'business_info'
const STEP_admin_account_info = 'admin_account_info'
const STEP_payment_info = 'payment_info'
const STEP_awaiting_dns = 'awaiting_dns'
const STEP_creating_vendor = 'creating_vendor'
const STEP_completed = 'completed'

const stepsList = [
  STEP_features,
  STEP_payment_model,
  STEP_business_info,
  STEP_admin_account_info,
  STEP_payment_info,
  STEP_awaiting_dns,
  STEP_creating_vendor,
  STEP_completed,
]

function currentStepIs(name: string) {
  return stepsList[step.value] === name
}

function setStepByName(stepName: string) {
  const _step = stepsList.indexOf(stepName)
  if (typeof _step === 'number') {
    step.value = _step
    if (stepName === STEP_creating_vendor) {
      setTimeout(() => loadingText.value = 'Please wait while we are preparing your platform...', 1)
      seekCompletedStatus()
    }else if (stepName === STEP_payment_info) {
      bootstrapPayment()
    }
  } else {
    alert('An error occured, Please contact support.')
  }
}

function bootstrapPayment(){
  if(paymentIntentId.value && redirectStatus.value === 'succeeded'){
    confirmStripePaymentIntent()
  }else{
    setTimeout(() => initStripePaymentElement(), 10)
  }
}

let stripeElements: any = null
let stripe: any = null
function initStripePaymentElement() {
  const st_pk = applicationDoc.value?.stripe_publishable_key
  const pi_cs = applicationDoc.value?.stripe_pi_client_secret
  if(!st_pk || !pi_cs){
    console.error('stripe_pi_client_secret or stripe_publishable_key not found')
    alert('Cannot initialize payment, Please refresh the page or contact our support if the issue persist.')
    return
  }
  const options = {
    clientSecret: pi_cs,
    appearance: {
      theme: 'flat',
      variables: {
        colorPrimary: '#2B39D4',
        borderRadius: '3px',
      },
    },
  };
  // @ts-ignore `Stripe` class is loaded global by a script link
  stripe = Stripe(st_pk);
  stripeElements = stripe.elements(options);
  const paymentElement = stripeElements.create('payment');
  paymentElement.mount('#stripe-payment-element');
}

async function submitStripePayment(){
  try {
    loadingText.value = 'Processing'
    const { error } = await stripe.confirmPayment({
      elements: stripeElements,
      confirmParams: {
        return_url: appLink.value,
      }
    })
    if(error){
      console.error('an error occured while confirming stripe payment')
      console.log(error)
      loadingText.value = ''
      setTimeout(() => alert(error.message), 10)
    }
  } catch (error) {
      console.error(error)
      alert('An error occured while processing the payment, If you have been charged please contact our support')
  }
  loadingText.value = ''
}

async function confirmStripePaymentIntent(){
  try {
    loadingText.value = 'Processing'
    const response = await fetch(`${Config.API_URL}/vendor-signup-applications/confirm-payment/${currentApplicationId.value}?payment_intent=${encodeURIComponent(paymentIntentId.value ?? '')}`, { method: 'POST' })
    const { status, error } = await response.json()
    if(error){
      alert(error)
    }else{
      setStepByName(status)
    }
  } catch (error) {
      console.error(error)
      alert('An error occured while processing the payment, If you have been charged please contact our support')
  }
    loadingText.value = ''
}

async function seekCompletedStatus() {
  while (true) {
    const response = await fetch(`${Config.API_URL}/vendor-signup-applications/application-data/${currentApplicationId.value}`)
    const { status } = await response.json()
    if (status === STEP_completed) {
      setStepByName(status)
      loadingText.value = ''
      break
    }
    await new Promise(r => setTimeout(r, 5000))
  }
}

const paymentModels = ref<any[]>([])
function filterApplicableModel(items: any[]) {
  const { feature_desktop_pos, feature_website, feature_mobileapp } = data.value
  const result: any[] = []
  for (let model of items) {
    const { desktop_pos, website, mobile_app } = model.features || {}
    const isApplicable = (
      !!desktop_pos === !!feature_desktop_pos &&
      !!website === !!feature_website &&
      !!mobile_app === !!feature_mobileapp
    )
    if (isApplicable) result.push(model)
  }
  return result
}
async function loadPaymentModels() {
  loadingText.value = 'Loading...'
  try {
    const response = await fetch(`${Config.API_URL}/payment-models`)
    const items = await response.json()
    paymentModels.value = filterApplicableModel(items)
    if (paymentModels.value.findIndex(m => m.id === data.value.payment_model) === -1) {
      data.value.payment_model = ''
    }
    setStepByName(STEP_payment_model)
  } catch (error) {
    console.error(error)
    alert('An error occured, Please contact support.')
  }
  loadingText.value = ''
}

const queryApplicationId = getQueryVariable('aid')
if (typeof queryApplicationId === 'string' && queryApplicationId.length > 1) {
  loadApplication(queryApplicationId)
} else {
  loadingText.value = ''
  step.value = 0
}

const appLink = ref<string | null>(null)
const paymentIntentId = ref<string | undefined>()
const redirectStatus = ref<string | undefined>()
if (queryApplicationId) {
  appLink.value = getQueryVariable('appLink') || window.location.href
  paymentIntentId.value = getQueryVariable('payment_intent')
  redirectStatus.value = getQueryVariable('redirect_status')
}

const nextBtnText = computed(() => {
  if(currentStepIs(STEP_awaiting_dns)){
    return 'Verify'
  }else if(currentStepIs(STEP_payment_info)){
    const mt = currentPaymentModel.value?.model_type
    return mt === 'one_off_payment' ? 'Pay & Subscribe' : 'Subscribe'
  }else{
    return 'Next'
  }
})

const formatPrice = (v: any) => {
  const val = parseFloat(v)
  if(isNaN(val)){
    return '--'
  }else{
    return '£' + val.toFixed(2)
  }
}

function fillTestInfo(){
  const d = data.value
  d.business_name =  'Green Food'
  d.domain_name =  'green-food.com'
  d.account_first_name =  'Test'
  d.account_last_name =  'Test'
  d.account_email =  'test.test@mail.com'
  d.account_phone =  '0000000000'
  d.account_password =  '123456789'
  d.account_repeat_password =  '123456789'
  setStepByName(STEP_admin_account_info)
}
</script>

<template>
  <main>
    <div class="form-wrapper">
      <form class="ui form">

        <div v-if="step == -1" class="initial">

        </div>

        <div v-if="currentStepIs('features')" class="features">
          <h2>Select features</h2>
          <p>
            Please select features you want to use:
          </p>

          <div class="feature-box">
            <div class="ui checked read-only checkbox">
              <input id="ftr_posapp" type="checkbox" checked="false" disabled>
              <label for="ftr_posapp">POS Application</label>
            </div>
            <p class="info">
              Efficient restaurant POS app: streamline orders, manage inventory, process payments,
              and handle online orders for seamless dining experiences.
            </p>
          </div>
          <div class="feature-box">
            <div class="ui checked checkbox">
              <input id="ftr_website" type="checkbox" v-model="data.feature_website">
              <label for="ftr_website">Website (Online ordering)</label>
            </div>
            <p class="info">   
              Dynamic restaurant website: showcases menu, enables online orders,
              and facilitates table bookings for an enhanced dining experience and seamless service.
            </p>
          </div>
          <div class="feature-box">
            <div class="ui checked checkbox">
              <input id="ftr_mobileapp" type="checkbox" v-model="data.feature_mobileapp">
              <label for="ftr_mobileapp">Mobile App</label>
            </div>
            <p class="info">
              Innovative restaurant mobile app: Explore menu, place orders,
              reserve tables,and enjoy seamless dining experiences on-the-go with effortless convenience.
            </p>
          </div>

        </div>

        <div v-if="currentStepIs('payment_model')">
          <h2>Payment Model</h2>
          <p>
            Choose how you want to pay fees: <br>
          <div style="height: 4px;"></div>

          <div v-for="model in paymentModels" :key="model.id" class="feature-box">
            <div class="ui checkbox">
              <input :id="model.id" type="radio" v-model="data.payment_model" :value="model.id">
              <label :for="model.id">{{ model.name }}</label>
            </div>
            <p v-if="model.model_type === 'monthly_fee'" class="info">
              {{ formatPrice(model.amount) }}/month subscription
            </p>
            <p v-else-if="model.model_type === 'percentage'" class="info">
              {{ model.amount }}% of orders value
            </p>
            <p v-else-if="model.model_type === 'one_off_payment'" class="info">
              {{ formatPrice(model.amount) }} + maintenance fee {{ formatPrice(model.maintenance) }}/month
            </p>
          </div>
          </p>
        </div>

        <div v-if="currentStepIs('business_info')" class="business-info">
          <h2>Business Information</h2>
          <InputField v-model.trim="data.business_name" name="business_name" label="Business Name"
            placeholder="My Restaurant" :emptyError="showErrors" />
          <InputField v-model.trim="data.domain_name" name="domain_name" label="Domain Name"
            placeholder="my-restaurant.com" description="Enter the domain name you wish to host the website on"
            :emptyError="showErrors" />
            <a v-if="isDev" @click="fillTestInfo">Fill test info</a>
        </div>

        <div v-if="currentStepIs('admin_account_info')" class="admin-account-info">
          <h2>Setup Admin Account</h2>
          <p>
            Used to login into platform's administration panel
          </p>
          <div class="two fields">
            <InputField :emptyError="showErrors" v-model.trim="data.account_first_name" name="first_name"
              label="First Name" />
            <InputField :emptyError="showErrors" v-model.trim="data.account_last_name" name="last_name"
              label="Last Name" />
          </div>
          <InputField :emptyError="showErrors" v-model.trim="data.account_phone" name="phone_number"
            label="Phone Number" />
          <InputField :emptyError="showErrors" v-model.trim="data.account_email" name="email" label="Email Address" />
          <InputField :emptyError="showErrors" v-model="data.account_password" type="password" name="password"
            label="Password" :errorMessage="passwordsError ? 'Passwords does not match' : ''" />
          <InputField :emptyError="showErrors" v-model="data.account_repeat_password" type="password"
            name="repeat_password" label="Repeat Password"
            :errorMessage="passwordsError ? 'Passwords does not match' : ''" />
        </div>

        <div v-if="currentStepIs('payment_info')" class="payment-info">
          <h2>Payment Information</h2>
          <div id="stripe-payment-element"></div>
          <br>
          <div class="order-summary">
            <h3>Order summary</h3>
            <table>
              <tbody>
                <tr v-if="currentPaymentModel?.model_type === 'monthly_fee'">
                  <td>Service Fees</td>
                  <td class="price">
                    {{ formatPrice(currentPaymentModel.amount) }} / Month
                  </td>
                </tr>
                <template v-else-if="currentPaymentModel?.model_type === 'one_off_payment'">
                  <tr>
                    <td>Life-Time Access (One Time Payment)</td>
                    <td class="price">
                      {{ formatPrice(currentPaymentModel.amount) }}
                    </td>
                  </tr>
                  <tr>
                    <td>Maintenance Fee</td>
                    <td class="price">
                      {{ formatPrice(currentPaymentModel.maintenance) }} / Month
                    </td>
                  </tr>
                  <tr>
                    <td><b>Total (Paid now)</b></td>
                    <td class="price">
                      {{ formatPrice(currentPaymentModel.amount + currentPaymentModel.maintenance) }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="currentStepIs('awaiting_dns') || currentStepIs('creating_vendor')" class="dns-config">
          <h2>Website Configuration</h2>
          <p>
            You need to update DNS Settings of your domain
            <br>
          </p>
          <div class="section-card">
            <h4>Navigate to the DNS settings of your domain name provider and perform the following actions then click the "Verify" button below:</h4>
            <ul class="config-steps" style="padding-left: 25px;">
              <li>
                Add <span>"A"</span> record <span>{{ web_data.domain_name }}</span> pointing to <span>{{ web_data.serverIP }}</span>
              </li>
              <li>
                Add <span>"A"</span> record <span>backend.{{ web_data.domain_name }}</span> pointing to <span>{{ web_data.serverIP }}</span>
              </li>
            </ul>
          </div>
          <br>
          <p>
            If you are unsure what dns settings are or how to edit them please contact your domain name provider and provide instructions from this page.
          </p>
          <p>
            * Please keep in mind that dns settings may take up to 24 hours to take effect, You can come back later and
            continue the registration.
          </p>
        </div>

        <div v-if="currentStepIs('completed')" class="completed-card">
          <h2>
            Completed
            <i class="check circle icon" style="color:#29A844"></i>
          </h2>
          <p>
            Your platform is ready, You can access it via: <br>
            <a :href="`http://backend.${web_data.domain_name}`" target="_blank">
              http://backend.{{ web_data.domain_name }}
            </a>
            <br>
            Use email address and password you've entered in previous steps to login.
          </p>
        </div>

        <br>

        <button v-if="step > 0 && step < 4" @click="previousStep" class="s-button" style="margin-right: 1rem"
          type="button">Back</button>
        <button v-if="step >= 0 && !currentStepIs('completed')" @click="nextStep" class="p-button" type="button">
          {{ nextBtnText }}
        </button>

        <div v-if="appLink && !currentStepIs('completed')" class="appLinkSection">
          You can resume your registration anytime using the link below: <br>
          <a :href="appLink" target="_parent">{{ appLink }}</a>
        </div>

      </form>
      <div class="ui inverted dimmer" :class="{ active: !!loadingText }">
        <div class="ui indeterminate text loader">{{ loadingText }}</div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.section-card{
  background-color: #F0F0F0;
  padding: 12px;
}
.form-wrapper {
  width: 100%;
  max-width: 500px;
  margin: auto;
  padding: 2rem;
  border: 2px solid #ebeef1;
  background: #fff;
}

.feature-box label {
  cursor: pointer;
  user-select: none;
}

.feature-box p.info {
  display: block;
  margin-left: 26px;
  color: #777777;
}

.appLinkSection {
  padding-top: 2rem;
  font-size: 12px;
}
.appLinkSection a {
  overflow-wrap: anywhere;
}
.config-steps li{
  font-weight: bold;
}
.config-steps li span{
  font-weight: bold;
  background-color: #AC9F5D80;
}
.order-summary{
  padding-bottom: 1rem;
}
.order-summary table{
  width: 100%;
  border-spacing: 0;
  background-color: #f5f5f5;
}
.order-summary td{
  border-bottom: 1px solid #aaaaaa;
  padding: 6px;
}
.order-summary td.price{
  text-align: right;
  font-weight: bold;
}
</style>

